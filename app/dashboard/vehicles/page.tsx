'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VehicleService, Vehicle, CreateVehicleRequest } from '@/lib/vehicles';
import Link from 'next/link';

function VehiclesContent() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    vin: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    trim: '',
    color: '',
    license_plate: '',
    mileage: 0,
    purchase_date: '',
    is_primary: false,
  });

  useEffect(() => {
    loadVehicles();
    
    // Check if should open add modal from URL
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const loadVehicles = async () => {
    try {
      const response = await VehicleService.getVehicles();
      if (response.data) {
        // Handle both array and object response formats
        const vehiclesList = Array.isArray(response.data) 
          ? response.data 
          : (response.data as unknown as { vehicles?: Vehicle[] }).vehicles || [];
        setVehicles(vehiclesList);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await VehicleService.createVehicle(formData);
      if (response.data) {
        setVehicles([...vehicles, response.data]);
        setSuccess('Vehicle added successfully!');
        setShowAddModal(false);
        setFormData({
          vin: '',
          year: new Date().getFullYear(),
          make: '',
          model: '',
          trim: '',
          color: '',
          license_plate: '',
          mileage: 0,
          purchase_date: '',
          is_primary: false,
        });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add vehicle';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      await VehicleService.setPrimaryVehicle(id);
      loadVehicles();
    } catch (err) {
      console.error('Failed to set primary vehicle:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      await VehicleService.deleteVehicle(id);
      setVehicles(vehicles.filter(v => v.id !== id));
      setSuccess('Vehicle deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  };

  const popularMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Lexus', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'Tesla'
  ];

  const colors = [
    'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 
    'Green', 'Brown', 'Beige', 'Gold', 'Orange', 'Yellow'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🚗</div>
          <p className="text-gray-400">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Vehicles</h1>
          <p className="text-gray-400 mt-1">Manage your registered vehicles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all transform hover:scale-105"
        >
          <span className="text-xl">➕</span>
          Add Vehicle
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="glass rounded-xl p-4 border border-green-500/30 bg-green-500/10 text-green-400 flex items-center gap-3">
          <span className="text-xl">✅</span>
          {success}
        </div>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🚗</div>
          <h2 className="text-2xl font-bold mb-3">No vehicles yet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Add your first vehicle to start tracking maintenance, get AI diagnostics, and find trusted repair shops.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105"
          >
            <span className="text-xl">➕</span>
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`glass-strong rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                vehicle.is_primary ? 'ring-2 ring-[#2ec8c6]' : ''
              }`}
            >
              {/* Vehicle Image/Icon Area */}
              <div className="h-40 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/10 flex items-center justify-center relative">
                <span className="text-7xl">🚗</span>
                {vehicle.is_primary && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-[#2ec8c6] text-black text-xs font-bold rounded-full">
                    PRIMARY
                  </span>
                )}
                {vehicle.color && (
                  <span className="absolute bottom-4 left-4 px-3 py-1 glass text-xs rounded-full">
                    {vehicle.color}
                  </span>
                )}
              </div>

              {/* Vehicle Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                {vehicle.trim && (
                  <p className="text-[#2ec8c6] text-sm mb-3">{vehicle.trim}</p>
                )}
                <p className="text-gray-400 text-sm mb-4 font-mono">{vehicle.vin}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold">{vehicle.mileage?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Miles</div>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <div className="text-lg font-bold">{vehicle.repair_count || 0}</div>
                    <div className="text-xs text-gray-400">Repairs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {vehicle.last_service_date 
                        ? new Date(vehicle.last_service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </div>
                    <div className="text-xs text-gray-400">Last Service</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/vehicles/${vehicle.id}`}
                    className="flex-1 text-center py-2.5 glass rounded-lg hover:bg-white/10 transition-colors font-medium"
                  >
                    View Details
                  </Link>
                  <div className="flex gap-2">
                    {!vehicle.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(vehicle.id)}
                        className="p-2.5 glass rounded-lg hover:bg-[#2ec8c6]/20 transition-colors"
                        title="Set as primary"
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2.5 glass rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
                      title="Delete vehicle"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold gradient-text mb-6">Add New Vehicle</h2>

            {error && (
              <div className="mb-6 p-4 glass rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* VIN */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  VIN (Vehicle Identification Number) *
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  placeholder="1HGCM82633A123456"
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors font-mono"
                  required
                  maxLength={17}
                  minLength={17}
                />
                <p className="text-xs text-gray-500 mt-1">17 characters, found on dashboard or door frame</p>
              </div>

              {/* Year, Make, Model */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Year *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Make *</label>
                  <select
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                    required
                  >
                    <option value="" className="bg-black">Select Make</option>
                    {popularMakes.map(make => (
                      <option key={make} value={make} className="bg-black">{make}</option>
                    ))}
                    <option value="Other" className="bg-black">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Accord"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Trim & Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Trim</label>
                  <input
                    type="text"
                    value={formData.trim}
                    onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                    placeholder="EX-L, Sport, Limited..."
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-black">Select Color</option>
                    {colors.map(color => (
                      <option key={color} value={color} className="bg-black">{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* License Plate & Mileage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">License Plate</label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                    placeholder="ABC1234"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Current Mileage *</label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                    placeholder="15000"
                    min={0}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-semibold mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                />
              </div>

              {/* Set as Primary */}
              <label className="flex items-center gap-3 glass rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-5 h-5 accent-[#2ec8c6]"
                />
                <div>
                  <div className="font-semibold">Set as primary vehicle</div>
                  <div className="text-sm text-gray-400">This will be your default vehicle for quick access</div>
                </div>
              </label>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 glass rounded-lg hover:bg-white/10 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🚗</div>
          <p className="text-gray-400">Loading vehicles...</p>
        </div>
      </div>
    }>
      <VehiclesContent />
    </Suspense>
  );
}

