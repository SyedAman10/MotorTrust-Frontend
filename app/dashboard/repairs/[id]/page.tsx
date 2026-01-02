'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RepairService, Repair, UpdateRepairRequest } from '@/lib/repairs';
import Link from 'next/link';

export default function RepairDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const repairId = Number(params.id);

  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<UpdateRepairRequest>({});
  const [partsInput, setPartsInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRepair();
  }, [repairId]);

  const loadRepair = async () => {
    try {
      const response = await RepairService.getRepair(repairId);
      if (response.data) {
        setRepair(response.data);
        setEditData({
          service_type: response.data.service_type,
          description: response.data.description,
          total_cost: parseFloat(response.data.total_cost),
          mileage_at_service: response.data.mileage_at_service,
          labor_hours: response.data.labor_hours,
          warranty_info: response.data.warranty_info,
        });
        setPartsInput(response.data.parts_replaced?.join(', ') || '');
      }
    } catch (error) {
      console.error('Failed to load repair:', error);
      router.push('/dashboard/repairs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...editData,
        parts_replaced: partsInput ? partsInput.split(',').map(p => p.trim()) : [],
      };

      const response = await RepairService.updateRepair(repairId, updateData);
      if (response.data) {
        setRepair(response.data);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Failed to update repair:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this repair record? This action cannot be undone.')) return;

    try {
      await RepairService.deleteRepair(repairId);
      router.push('/dashboard/repairs');
    } catch (error) {
      console.error('Failed to delete repair:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🔧</div>
          <p className="text-gray-400">Loading repair details...</p>
        </div>
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-2">Repair not found</h2>
        <Link href="/dashboard/repairs" className="text-[#2ec8c6] hover:underline">
          Back to repairs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard/repairs" className="hover:text-white transition-colors">Repairs</Link>
        <span>/</span>
        <span className="text-white">{repair.service_type}</span>
      </div>

      {/* Header */}
      <div className="glass-strong rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-3xl">
              🔧
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{repair.service_type}</h1>
              <p className="text-gray-400">
                {repair.year} {repair.make} {repair.model}
              </p>
              <p className="text-gray-500 font-mono text-sm">{repair.vin}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-2.5 glass rounded-lg hover:bg-white/10 transition-colors font-semibold flex items-center gap-2"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 glass rounded-lg hover:bg-red-500/20 text-red-400 transition-colors font-semibold flex items-center gap-2"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Cost & Date */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-[#2ec8c6]">${repair.total_cost}</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Service Date</div>
            <div className="text-xl font-bold">
              {new Date(repair.service_date).toLocaleDateString()}
            </div>
          </div>
          {repair.mileage_at_service && (
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Mileage</div>
              <div className="text-xl font-bold">{repair.mileage_at_service.toLocaleString()} mi</div>
            </div>
          )}
          {repair.labor_hours && (
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Labor Hours</div>
              <div className="text-xl font-bold">{repair.labor_hours} hrs</div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {repair.description && (
        <div className="glass-strong rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Description</h2>
          <p className="text-gray-300">{repair.description}</p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Parts Replaced */}
        {repair.parts_replaced && repair.parts_replaced.length > 0 && (
          <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Parts Replaced</h2>
            <div className="flex flex-wrap gap-2">
              {repair.parts_replaced.map((part, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 glass rounded-full text-sm"
                >
                  {part}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* OBD Codes */}
        {repair.odb_codes && repair.odb_codes.length > 0 && (
          <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">OBD Codes</h2>
            <div className="flex flex-wrap gap-2">
              {repair.odb_codes.map((code, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm font-mono"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shop Info */}
        {repair.shop_name && (
          <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Shop Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏪</span>
                <div>
                  <div className="font-semibold">{repair.shop_name}</div>
                  {repair.shop_rating && (
                    <div className="text-yellow-400 text-sm">⭐ {repair.shop_rating} rating</div>
                  )}
                </div>
              </div>
              {repair.shop_address && (
                <div className="flex items-center gap-3 text-gray-400">
                  <span>📍</span>
                  <span>{repair.shop_address}</span>
                </div>
              )}
              {repair.shop_phone && (
                <div className="flex items-center gap-3 text-gray-400">
                  <span>📞</span>
                  <span>{repair.shop_phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warranty */}
        {repair.warranty_info && (
          <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Warranty</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <span className="text-lg">{repair.warranty_info}</span>
            </div>
          </div>
        )}
      </div>

      {/* Invoice & Photos */}
      {(repair.invoice_url || (repair.photos && repair.photos.length > 0)) && (
        <div className="glass-strong rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Documents & Photos</h2>
          <div className="flex flex-wrap gap-4">
            {repair.invoice_url && (
              <a
                href={repair.invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-4 hover:bg-white/10 transition-colors flex items-center gap-3"
              >
                <span className="text-2xl">📄</span>
                <span>View Invoice</span>
              </a>
            )}
            {repair.photos?.map((photo, idx) => (
              <a
                key={idx}
                href={photo}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-4 hover:bg-white/10 transition-colors flex items-center gap-3"
              >
                <span className="text-2xl">🖼️</span>
                <span>Photo {idx + 1}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Insurance Claim */}
      {repair.insurance_claim_id && (
        <div className="glass-strong rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🏥</span>
            <div>
              <div className="text-sm text-gray-400">Insurance Claim ID</div>
              <div className="text-xl font-bold font-mono">{repair.insurance_claim_id}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-strong rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/dashboard/vehicles/${repair.vehicle_id}`}
            className="glass rounded-lg px-5 py-3 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <span>🚗</span>
            View Vehicle
          </Link>
          <Link
            href="/dashboard/repairs?add=true"
            className="glass rounded-lg px-5 py-3 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Add Another Repair
          </Link>
          <Link
            href="/dashboard/shops"
            className="glass rounded-lg px-5 py-3 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <span>🔧</span>
            Find Shops
          </Link>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative glass-strong rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold gradient-text mb-6">Edit Repair</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Service Type</label>
                <input
                  type="text"
                  value={editData.service_type || ''}
                  onChange={(e) => setEditData({ ...editData, service_type: e.target.value })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Total Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editData.total_cost || ''}
                  onChange={(e) => setEditData({ ...editData, total_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Mileage at Service</label>
                <input
                  type="number"
                  value={editData.mileage_at_service || ''}
                  onChange={(e) => setEditData({ ...editData, mileage_at_service: parseInt(e.target.value) || 0 })}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Parts Replaced</label>
                <input
                  type="text"
                  value={partsInput}
                  onChange={(e) => setPartsInput(e.target.value)}
                  placeholder="Comma separated"
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Labor Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editData.labor_hours || ''}
                    onChange={(e) => setEditData({ ...editData, labor_hours: parseFloat(e.target.value) || 0 })}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Warranty</label>
                  <input
                    type="text"
                    value={editData.warranty_info || ''}
                    onChange={(e) => setEditData({ ...editData, warranty_info: e.target.value })}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  />
                </div>
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

