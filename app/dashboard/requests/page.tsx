'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ShopService, RepairLead, CreateRepairLeadRequest, getImageUrl, UrgencyLevel } from '@/lib/shops';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function MyRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<RepairLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Image upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Prevent double-fetch in React 18 StrictMode
  const hasFetched = useRef(false);

  // Create form
  const [formData, setFormData] = useState<Omit<CreateRepairLeadRequest, 'images'>>({
    title: '',
    description: '',
    car_make: '',
    car_model: '',
    car_year: new Date().getFullYear(),
    urgency: 'normal',
  });

  const loadLeads = useCallback(async () => {
    try {
      const response = await ShopService.getMyLeads();
      if (response.data?.leads) {
        setLeads(response.data.leads);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const checkAccess = async () => {
      try {
        const response = await AuthService.getCurrentUser();
        if (response.data) {
          setUser(response.data);
          if (response.data.role !== 'car_owner') {
            router.push('/dashboard');
            return;
          }
          loadLeads();
        }
      } catch (err) {
        console.error('Access check failed:', err);
        router.push('/signup');
      }
    };

    checkAccess();
  }, [router, loadLeads]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Keep loadLeads callable for refresh after creating new lead
  const refreshLeads = async () => {
    try {
      const response = await ShopService.getMyLeads();
      if (response.data?.leads) {
        setLeads(response.data.leads);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const maxFiles = 5;
    const remainingSlots = maxFiles - selectedImages.length;
    
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    // Validate file types and sizes
    const validFiles: File[] = [];
    const validPreviews: string[] = [];
    
    filesToAdd.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Each image must be less than 5MB');
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    setSelectedImages([...selectedImages, ...validFiles]);
    setImagePreviews([...imagePreviews, ...validPreviews]);
    setError('');
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      car_make: '',
      car_model: '',
      car_year: new Date().getFullYear(),
      urgency: 'normal',
    });
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const requestData: CreateRepairLeadRequest = {
        ...formData,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      };
      
      const response = await ShopService.createLead(requestData);
      if (response.data?.lead) {
        setLeads([response.data.lead, ...leads]);
        setSuccess('Repair request created! Shops will start submitting proposals.');
        setShowCreateModal(false);
        resetForm();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create request';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'normal': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-[#2ec8c6]/20 text-[#2ec8c6]';
    }
  };

  const carMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
    'Audi', 'Lexus', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'Tesla', 'Other'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🔧</div>
          <p className="text-gray-400">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'car_owner') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-400">Only car owners can access this page</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Repair Requests</h1>
          <p className="text-gray-400 mt-1">Create requests and receive proposals from repair shops</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all transform hover:scale-105"
        >
          <span className="text-xl">➕</span>
          New Request
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="glass rounded-xl p-4 border border-green-500/30 bg-green-500/10 text-green-400 flex items-center gap-3">
          <span className="text-xl">✅</span>
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📋</span>
            <span className="text-gray-400 text-sm">Total Requests</span>
          </div>
          <div className="text-3xl font-bold">{leads.length}</div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🟢</span>
            <span className="text-gray-400 text-sm">Open</span>
          </div>
          <div className="text-3xl font-bold text-[#2ec8c6]">
            {leads.filter(l => l.status === 'open').length}
          </div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💬</span>
            <span className="text-gray-400 text-sm">Total Proposals</span>
          </div>
          <div className="text-3xl font-bold">
            {leads.reduce((acc, l) => acc + (l.proposal_count || 0), 0)}
          </div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-gray-400 text-sm">Completed</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {leads.filter(l => l.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {leads.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🔧</div>
          <h2 className="text-2xl font-bold mb-3">No repair requests yet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Create your first repair request and receive quotes from trusted repair shops.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105"
          >
            <span className="text-xl">➕</span>
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/dashboard/requests/${lead.id}`}
              className="block glass-strong rounded-2xl p-6 hover:scale-[1.01] transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Thumbnail or icon */}
                  {lead.images && lead.images.length > 0 ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                      <img
                        src={getImageUrl(lead.images[0])}
                        alt="Issue"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {lead.images.length > 1 && (
                        <div className="absolute bottom-0 right-0 bg-black/70 text-xs px-1 rounded-tl">
                          +{lead.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      🚗
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold truncate">{lead.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getUrgencyColor(lead.urgency)}`}>
                        {lead.urgency}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {lead.car_year} {lead.car_make} {lead.car_model}
                    </p>
                    <p className="text-gray-500 text-sm line-clamp-1">{lead.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2ec8c6]">{lead.proposal_count || 0}</div>
                    <div className="text-sm text-gray-400">Proposals</div>
                  </div>
                  <div className="text-gray-400">→</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => { setShowCreateModal(false); resetForm(); }}
          />
          <div className="relative glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="absolute top-4 right-4 p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold gradient-text mb-2">Create Repair Request</h2>
            <p className="text-gray-400 mb-6">Describe your car issue and get quotes from repair shops</p>

            {error && (
              <div className="mb-6 p-4 glass rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Brake pads replacement needed"
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue in detail. What symptoms are you experiencing? When did it start? (minimum 20 characters)"
                  rows={4}
                  className={`w-full glass rounded-lg px-4 py-3 bg-transparent border focus:outline-none resize-none transition-colors ${
                    formData.description.length > 0 && formData.description.length < 20
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-700 focus:border-[#2ec8c6]'
                  }`}
                  required
                  minLength={20}
                />
                <div className="flex justify-between mt-1">
                  <p className={`text-xs ${
                    formData.description.length > 0 && formData.description.length < 20
                      ? 'text-red-400'
                      : 'text-gray-500'
                  }`}>
                    {formData.description.length < 20 
                      ? `Minimum 20 characters (${20 - formData.description.length} more needed)`
                      : '✓ Minimum length met'
                    }
                  </p>
                  <p className="text-xs text-gray-500">{formData.description.length} / 20+</p>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Photos <span className="text-gray-500 font-normal">(optional, max 5)</span>
                </label>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="w-20 h-20 rounded-lg overflow-hidden relative">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {selectedImages.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="glass rounded-lg border-2 border-dashed border-gray-600 hover:border-[#2ec8c6] p-6 text-center cursor-pointer transition-colors"
                  >
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-gray-400 text-sm">
                      Click to upload photos of the issue
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      JPG, PNG up to 5MB each
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Car Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Car Make *</label>
                  <select
                    value={formData.car_make}
                    onChange={(e) => setFormData({ ...formData, car_make: e.target.value })}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                    required
                  >
                    <option value="" className="bg-black">Select Make</option>
                    {carMakes.map(make => (
                      <option key={make} value={make} className="bg-black">{make}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Car Model *</label>
                  <input
                    type="text"
                    value={formData.car_model}
                    onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                    placeholder="e.g., Camry"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Year *</label>
                  <input
                    type="number"
                    value={formData.car_year}
                    onChange={(e) => setFormData({ ...formData, car_year: parseInt(e.target.value) })}
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-semibold mb-2">Urgency *</label>
                <div className="grid grid-cols-4 gap-3">
                  {([
                    { value: 'low', icon: '🟢', label: 'Low', color: 'green' },
                    { value: 'normal', icon: '🔵', label: 'Normal', color: 'blue' },
                    { value: 'high', icon: '🟠', label: 'High', color: 'orange' },
                    { value: 'urgent', icon: '🔥', label: 'Urgent', color: 'red' },
                  ] as const).map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: level.value as UrgencyLevel })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.urgency === level.value
                          ? `border-${level.color}-500 bg-${level.color}-500/10`
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      style={formData.urgency === level.value ? {
                        borderColor: level.color === 'green' ? '#22c55e' :
                                     level.color === 'blue' ? '#3b82f6' :
                                     level.color === 'orange' ? '#f97316' : '#ef4444',
                        backgroundColor: level.color === 'green' ? 'rgba(34, 197, 94, 0.1)' :
                                         level.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' :
                                         level.color === 'orange' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                      } : {}}
                    >
                      <div className="text-xl mb-1">{level.icon}</div>
                      <div className="font-semibold text-sm">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 py-3 glass rounded-lg hover:bg-white/10 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      {selectedImages.length > 0 ? 'Uploading...' : 'Creating...'}
                    </>
                  ) : (
                    'Create Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
