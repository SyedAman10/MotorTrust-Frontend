'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VehicleService, Vehicle, VehicleStats, RepairRecord, UpdateVehicleRequest } from '@/lib/vehicles';
import Link from 'next/link';

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = Number(params.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [repairs, setRepairs] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'repairs' | 'stats'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<UpdateVehicleRequest>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVehicleData();
  }, [vehicleId]);

  const loadVehicleData = async () => {
    try {
      const [vehicleRes, statsRes, repairsRes] = await Promise.all([
        VehicleService.getVehicle(vehicleId),
        VehicleService.getVehicleStats(vehicleId).catch(() => null),
        VehicleService.getVehicleRepairs(vehicleId).catch(() => ({ data: [] })),
      ]);

      if (vehicleRes.data) {
        setVehicle(vehicleRes.data);
        setEditData({
          mileage: vehicleRes.data.mileage,
          color: vehicleRes.data.color,
          license_plate: vehicleRes.data.license_plate,
          trim: vehicleRes.data.trim,
        });
      }
      if (statsRes?.data) setStats(statsRes.data);
      if (repairsRes?.data) setRepairs(repairsRes.data);
    } catch (error) {
      console.error('Failed to load vehicle:', error);
      router.push('/dashboard/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await VehicleService.updateVehicle(vehicleId, editData);
      if (response.data) {
        setVehicle(response.data);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Failed to update vehicle:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async () => {
    try {
      await VehicleService.setPrimaryVehicle(vehicleId);
      loadVehicleData();
    } catch (error) {
      console.error('Failed to set primary:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) return;

    try {
      await VehicleService.deleteVehicle(vehicleId);
      router.push('/dashboard/vehicles');
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🚗</div>
          <p className="text-gray-400">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-2">Vehicle not found</h2>
        <Link href="/dashboard/vehicles" className="text-[#2ec8c6] hover:underline">
          Back to vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard/vehicles" className="hover:text-white transition-colors">Vehicles</Link>
        <span>/</span>
        <span className="text-white">{vehicle.year} {vehicle.make} {vehicle.model}</span>
      </div>

      {/* Vehicle Header */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-[#2ec8c6]/30 via-[#1a9a99]/20 to-transparent flex items-center justify-center relative">
          <span className="text-8xl">🚗</span>
          {vehicle.is_primary && (
            <span className="absolute top-6 right-6 px-4 py-2 bg-[#2ec8c6] text-black font-bold rounded-full flex items-center gap-2">
              <span>⭐</span> Primary Vehicle
            </span>
          )}
        </div>

        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.trim && (
                <p className="text-[#2ec8c6] text-xl mb-2">{vehicle.trim}</p>
              )}
              <p className="text-gray-400 font-mono text-lg">{vehicle.vin}</p>

              <div className="flex flex-wrap gap-3 mt-4">
                {vehicle.color && (
                  <span className="px-3 py-1 glass rounded-full text-sm">
                    🎨 {vehicle.color}
                  </span>
                )}
                {vehicle.license_plate && (
                  <span className="px-3 py-1 glass rounded-full text-sm">
                    🔢 {vehicle.license_plate}
                  </span>
                )}
                {vehicle.purchase_date && (
                  <span className="px-3 py-1 glass rounded-full text-sm">
                    📅 Purchased {new Date(vehicle.purchase_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-colors font-semibold flex items-center gap-2"
              >
                <span>✏️</span> Edit
              </button>
              {!vehicle.is_primary && (
                <button
                  onClick={handleSetPrimary}
                  className="px-6 py-3 glass rounded-lg hover:bg-[#2ec8c6]/20 transition-colors font-semibold flex items-center gap-2"
                >
                  <span>⭐</span> Set Primary
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-6 py-3 glass rounded-lg hover:bg-red-500/20 text-red-400 transition-colors font-semibold flex items-center gap-2"
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">📏</div>
          <div className="text-3xl font-bold">{vehicle.mileage?.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Current Mileage</div>
        </div>
        <div className="glass-strong rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">🔧</div>
          <div className="text-3xl font-bold">{stats?.total_repairs || vehicle.repair_count || 0}</div>
          <div className="text-gray-400 text-sm">Total Repairs</div>
        </div>
        <div className="glass-strong rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-3xl font-bold">${stats?.total_cost || vehicle.total_repair_cost || '0'}</div>
          <div className="text-gray-400 text-sm">Total Spent</div>
        </div>
        <div className="glass-strong rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-3xl font-bold">
            {vehicle.last_service_date 
              ? new Date(vehicle.last_service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'}
          </div>
          <div className="text-gray-400 text-sm">Last Service</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/10">
          {(['overview', 'repairs', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? 'text-[#2ec8c6] border-b-2 border-[#2ec8c6] bg-[#2ec8c6]/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'overview' && '📋 '}
              {tab === 'repairs' && '🔧 '}
              {tab === 'stats' && '📊 '}
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold mb-4">Vehicle Information</h3>
                  <div className="glass rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">VIN</span>
                      <span className="font-mono">{vehicle.vin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year</span>
                      <span>{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Make</span>
                      <span>{vehicle.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model</span>
                      <span>{vehicle.model}</span>
                    </div>
                    {vehicle.trim && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trim</span>
                        <span>{vehicle.trim}</span>
                      </div>
                    )}
                    {vehicle.color && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Color</span>
                        <span>{vehicle.color}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      href="/dashboard/diagnosis"
                      className="block glass rounded-lg p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">🔍</span>
                        <div>
                          <div className="font-semibold">Run AI Diagnosis</div>
                          <div className="text-sm text-gray-400">Get instant vehicle health analysis</div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/shops"
                      className="block glass rounded-lg p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">🔧</span>
                        <div>
                          <div className="font-semibold">Find Repair Shops</div>
                          <div className="text-sm text-gray-400">Connect with trusted mechanics</div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/reports"
                      className="block glass rounded-lg p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">📊</span>
                        <div>
                          <div className="font-semibold">Generate Report</div>
                          <div className="text-sm text-gray-400">Get detailed vehicle history report</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Repairs Tab */}
          {activeTab === 'repairs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Repair History</h3>
                <Link 
                  href={`/dashboard/repairs?add=true&vehicle=${vehicleId}`}
                  className="px-4 py-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-semibold rounded-lg transition-colors"
                >
                  + Add Repair
                </Link>
              </div>

              {repairs.length > 0 ? (
                <div className="space-y-4">
                  {repairs.map((repair) => (
                    <div key={repair.id} className="glass rounded-xl p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-2xl">
                            🔧
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{repair.service_type}</h4>
                            <p className="text-gray-400 text-sm mb-2">{repair.description}</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="text-gray-400">
                                📅 {new Date(repair.service_date).toLocaleDateString()}
                              </span>
                              {repair.shop_name && (
                                <span className="text-gray-400">
                                  🏪 {repair.shop_name}
                                </span>
                              )}
                              {repair.shop_rating && (
                                <span className="text-yellow-400">
                                  ⭐ {repair.shop_rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#2ec8c6]">
                            ${repair.total_cost}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass rounded-xl">
                  <div className="text-5xl mb-4">🔧</div>
                  <h4 className="text-xl font-bold mb-2">No repair records yet</h4>
                  <p className="text-gray-400 mb-6">Start tracking your vehicle&apos;s service history</p>
                  <Link 
                    href={`/dashboard/repairs?add=true&vehicle=${vehicleId}`}
                    className="inline-block px-6 py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-colors"
                  >
                    Add First Repair
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Vehicle Statistics</h3>
              
              {stats ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="glass rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Current Mileage</div>
                    <div className="text-3xl font-bold">{stats.current_mileage?.toLocaleString()} mi</div>
                  </div>
                  <div className="glass rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Total Repairs</div>
                    <div className="text-3xl font-bold">{stats.total_repairs}</div>
                  </div>
                  <div className="glass rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Total Cost</div>
                    <div className="text-3xl font-bold text-[#2ec8c6]">${stats.total_cost}</div>
                  </div>
                  <div className="glass rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Avg Repair Cost</div>
                    <div className="text-3xl font-bold">${stats.avg_repair_cost}</div>
                  </div>
                  <div className="glass rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">First Service</div>
                    <div className="text-xl font-bold">
                      {stats.first_service_date 
                        ? new Date(stats.first_service_date).toLocaleDateString() 
                        : 'No records'}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Last Service</div>
                    <div className="text-xl font-bold">
                      {stats.last_service_date 
                        ? new Date(stats.last_service_date).toLocaleDateString() 
                        : 'No records'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 glass rounded-xl">
                  <div className="text-5xl mb-4">📊</div>
                  <h4 className="text-xl font-bold mb-2">No statistics available</h4>
                  <p className="text-gray-400">Add repair records to see vehicle statistics</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative glass-strong rounded-2xl p-8 max-w-lg w-full">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold gradient-text mb-6">Edit Vehicle</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Current Mileage</label>
                <input
                  type="number"
                  value={editData.mileage || ''}
                  onChange={(e) => setEditData({ ...editData, mileage: parseInt(e.target.value) || 0 })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Color</label>
                <input
                  type="text"
                  value={editData.color || ''}
                  onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">License Plate</label>
                <input
                  type="text"
                  value={editData.license_plate || ''}
                  onChange={(e) => setEditData({ ...editData, license_plate: e.target.value.toUpperCase() })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Trim</label>
                <input
                  type="text"
                  value={editData.trim || ''}
                  onChange={(e) => setEditData({ ...editData, trim: e.target.value })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 glass rounded-lg hover:bg-white/10 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

