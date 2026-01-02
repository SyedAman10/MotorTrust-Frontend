'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RepairService, Repair, CreateRepairRequest, RepairStats } from '@/lib/repairs';
import { VehicleService, Vehicle } from '@/lib/vehicles';
import Link from 'next/link';

function RepairsContent() {
  const searchParams = useSearchParams();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<RepairStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Form state
  const [formData, setFormData] = useState<CreateRepairRequest>({
    vehicle_id: 0,
    service_date: new Date().toISOString().split('T')[0],
    service_type: '',
    description: '',
    total_cost: 0,
    mileage_at_service: 0,
    parts_replaced: [],
    labor_hours: 0,
    warranty_info: '',
  });

  const [partsInput, setPartsInput] = useState('');

  useEffect(() => {
    loadData();
    
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [repairsRes, vehiclesRes, statsRes] = await Promise.all([
        RepairService.getRepairs(),
        VehicleService.getVehicles(),
        RepairService.getStats().catch(() => null),
      ]);

      if (repairsRes.data) {
        const repairsList = Array.isArray(repairsRes.data) ? repairsRes.data : [];
        setRepairs(repairsList);
      }
      if (vehiclesRes.data) {
        // Handle both array and object response formats
        const vehiclesList = Array.isArray(vehiclesRes.data) 
          ? vehiclesRes.data 
          : (vehiclesRes.data as unknown as { vehicles?: Vehicle[] }).vehicles || [];
        setVehicles(vehiclesList);
        if (vehiclesList.length > 0 && formData.vehicle_id === 0) {
          setFormData(prev => ({ ...prev, vehicle_id: vehiclesList[0].id }));
        }
      }
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await RepairService.searchRepairs(searchQuery);
      if (response.data) setRepairs(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = async () => {
    if (!dateRange.start || !dateRange.end) return;

    try {
      setLoading(true);
      const response = await RepairService.getRepairsByDateRange(dateRange.start, dateRange.end);
      if (response.data) setRepairs(response.data);
    } catch (err) {
      console.error('Date filter failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        parts_replaced: partsInput ? partsInput.split(',').map(p => p.trim()) : [],
      };

      const response = await RepairService.createRepair(submitData);
      if (response.data) {
        setSuccess('Repair record added successfully!');
        setShowAddModal(false);
        loadData();
        // Reset form
        setFormData({
          vehicle_id: vehicles[0]?.id || 0,
          service_date: new Date().toISOString().split('T')[0],
          service_type: '',
          description: '',
          total_cost: 0,
          mileage_at_service: 0,
          parts_replaced: [],
          labor_hours: 0,
          warranty_info: '',
        });
        setPartsInput('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add repair';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this repair record?')) return;

    try {
      await RepairService.deleteRepair(id);
      setRepairs(repairs.filter(r => r.id !== id));
      setSuccess('Repair record deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete repair:', err);
    }
  };

  const serviceTypes = [
    'Oil Change',
    'Brake Service',
    'Tire Service',
    'Engine Repair',
    'Transmission Service',
    'Battery Replacement',
    'AC Service',
    'Electrical Repair',
    'Suspension Work',
    'Exhaust Repair',
    'Diagnostic Check',
    'General Maintenance',
    'Body Work',
    'Other',
  ];

  const filteredRepairs = repairs.filter(repair => {
    if (filterVehicle !== 'all' && repair.vehicle_id !== parseInt(filterVehicle)) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🔧</div>
          <p className="text-gray-400">Loading repairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Repair History</h1>
          <p className="text-gray-400 mt-1">Track and manage all your vehicle repairs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={vehicles.length === 0}
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">➕</span>
          Add Repair
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-strong rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔧</span>
              <span className="text-gray-400 text-sm">Total Repairs</span>
            </div>
            <div className="text-3xl font-bold">{stats.total_repairs}</div>
          </div>
          <div className="glass-strong rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-gray-400 text-sm">Total Spent</span>
            </div>
            <div className="text-3xl font-bold text-[#2ec8c6]">${stats.total_spent}</div>
          </div>
          <div className="glass-strong rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-gray-400 text-sm">Avg Cost</span>
            </div>
            <div className="text-3xl font-bold">${stats.avg_repair_cost}</div>
          </div>
          <div className="glass-strong rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏪</span>
              <span className="text-gray-400 text-sm">Shops Used</span>
            </div>
            <div className="text-3xl font-bold">{stats.shops_used}</div>
          </div>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="glass rounded-xl p-4 border border-green-500/30 bg-green-500/10 text-green-400 flex items-center gap-3">
          <span className="text-xl">✅</span>
          {success}
        </div>
      )}

      {/* No vehicles warning */}
      {vehicles.length === 0 && (
        <div className="glass-strong rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🚗</div>
          <h3 className="text-xl font-bold mb-2">No vehicles registered</h3>
          <p className="text-gray-400 mb-6">Add a vehicle first to start tracking repairs</p>
          <Link
            href="/dashboard/vehicles?add=true"
            className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all"
          >
            Add Vehicle
          </Link>
        </div>
      )}

      {/* Filters */}
      {vehicles.length > 0 && (
        <div className="glass-strong rounded-2xl p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search repairs..."
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Vehicle Filter */}
            <div>
              <select
                value={filterVehicle}
                onChange={(e) => setFilterVehicle(e.target.value)}
                className="w-full px-4 py-3 glass rounded-xl bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
              >
                <option value="all" className="bg-black">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-black">
                    {v.year} {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div>
              <button
                onClick={handleSearch}
                className="w-full py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-xl transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-4 pt-4 border-t border-white/10 grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 glass rounded-lg bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 glass rounded-lg bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleDateFilter}
                disabled={!dateRange.start || !dateRange.end}
                className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Filter by Date
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateRange({ start: '', end: '' });
                  setSearchQuery('');
                  setFilterVehicle('all');
                  loadData();
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repairs List */}
      {filteredRepairs.length === 0 && vehicles.length > 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🔧</div>
          <h2 className="text-2xl font-bold mb-3">No repair records yet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Start tracking your vehicle maintenance to build a complete service history.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105"
          >
            <span className="text-xl">➕</span>
            Add Your First Repair
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRepairs.map((repair) => (
            <div
              key={repair.id}
              className="glass-strong rounded-2xl p-6 hover:scale-[1.01] transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Icon & Type */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-2xl">
                    🔧
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{repair.service_type}</h3>
                    <p className="text-gray-400 text-sm">
                      {repair.year} {repair.make} {repair.model}
                    </p>
                    {repair.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                        {repair.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Date</div>
                    <div className="font-semibold">
                      {new Date(repair.service_date).toLocaleDateString()}
                    </div>
                  </div>
                  {repair.mileage_at_service && (
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Mileage</div>
                      <div className="font-semibold">{repair.mileage_at_service.toLocaleString()} mi</div>
                    </div>
                  )}
                  {repair.shop_name && (
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Shop</div>
                      <div className="font-semibold flex items-center gap-1">
                        {repair.shop_name}
                        {repair.shop_rating && (
                          <span className="text-yellow-400 text-sm">⭐ {repair.shop_rating}</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Cost</div>
                    <div className="text-xl font-bold text-[#2ec8c6]">${repair.total_cost}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/repairs/${repair.id}`}
                    className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(repair.id)}
                    className="px-4 py-2 glass rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Parts replaced */}
              {repair.parts_replaced && repair.parts_replaced.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                  <span className="text-gray-400 text-sm">Parts:</span>
                  {repair.parts_replaced.map((part, idx) => (
                    <span key={idx} className="px-2 py-1 glass rounded text-xs">
                      {part}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Repair Modal */}
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

            <h2 className="text-2xl font-bold gradient-text mb-6">Add Repair Record</h2>

            {error && (
              <div className="mb-6 p-4 glass rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Vehicle *</label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: parseInt(e.target.value) })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id} className="bg-black">
                      {v.year} {v.make} {v.model} ({v.vin})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Type & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Service Type *</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                    required
                  >
                    <option value="" className="bg-black">Select service type</option>
                    {serviceTypes.map((type) => (
                      <option key={type} value={type} className="bg-black">{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Service Date *</label>
                  <input
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Cost & Mileage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Total Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_cost || ''}
                    onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mileage at Service</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mileage_at_service || ''}
                    onChange={(e) => setFormData({ ...formData, mileage_at_service: parseInt(e.target.value) || 0 })}
                    placeholder="15000"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the service or repairs performed..."
                  rows={3}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none resize-none"
                />
              </div>

              {/* Parts Replaced */}
              <div>
                <label className="block text-sm font-semibold mb-2">Parts Replaced</label>
                <input
                  type="text"
                  value={partsInput}
                  onChange={(e) => setPartsInput(e.target.value)}
                  placeholder="Oil Filter, Air Filter, Spark Plugs (comma separated)"
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple parts with commas</p>
              </div>

              {/* Labor Hours & Warranty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Labor Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.labor_hours || ''}
                    onChange={(e) => setFormData({ ...formData, labor_hours: parseFloat(e.target.value) || 0 })}
                    placeholder="1.5"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Warranty Info</label>
                  <input
                    type="text"
                    value={formData.warranty_info || ''}
                    onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
                    placeholder="6 months / 6000 miles"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  />
                </div>
              </div>

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
                  {submitting ? 'Adding...' : 'Add Repair'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RepairsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🔧</div>
          <p className="text-gray-400">Loading repairs...</p>
        </div>
      </div>
    }>
      <RepairsContent />
    </Suspense>
  );
}

