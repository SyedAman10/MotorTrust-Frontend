'use client';

import { useEffect, useState, use, useRef, useCallback } from 'react';
import { ShopService, RepairLead, CreateProposalRequest, getImageUrl } from '@/lib/shops';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'open': return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [lead, setLead] = useState<RepairLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Proposal form state
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalMessage, setProposalMessage] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchedRef = useRef(false);

  const fetchLead = useCallback(async () => {
    try {
      const response = await ShopService.getLead(parseInt(id));
      if (response.success && response.data) {
        setLead(response.data.lead);
      } else {
        setError('Lead not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const initPage = async () => {
      try {
        const response = await AuthService.getCurrentUser();
        if (!response.success || !response.data) {
          router.push('/signup');
          return;
        }
        setUser(response.data);
        fetchLead();
      } catch {
        router.push('/signup');
      }
    };

    initPage();
  }, [router, fetchLead]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (proposalMessage.length < 20) {
      setSubmitError('Message must be at least 20 characters');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const proposalData: CreateProposalRequest = {
        repair_lead_id: lead.id,
        message: proposalMessage,
        estimated_cost: parseFloat(estimatedCost),
        estimated_days: parseInt(estimatedDays),
      };

      await ShopService.submitProposal(proposalData);
      setSubmitSuccess(true);
      setShowProposalForm(false);
      // Refresh lead to get updated proposals
      fetchLead();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (lead?.images) {
      setLightboxIndex((prev) => (prev + 1) % lead.images.length);
    }
  };

  const prevImage = () => {
    if (lead?.images) {
      setLightboxIndex((prev) => (prev - 1 + lead.images.length) % lead.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2ec8c6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Lead Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The lead you are looking for does not exist.'}</p>
          <Link 
            href="/dashboard/leads"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            ← Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  const hasSubmittedProposal = lead.proposals?.some(
    (p) => p.shop_owner?.id === user?.id
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/leads"
            className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lead.title}</h1>
            <p className="text-gray-400">
              {lead.car_year} {lead.car_make} {lead.car_model}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(lead.status)}`}>
            {lead.status.replace('_', ' ')}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getUrgencyColor(lead.urgency)}`}>
            {lead.urgency}
          </span>
        </div>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="glass rounded-xl p-4 border border-green-500/30 bg-green-500/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-400">Proposal Submitted!</p>
              <p className="text-sm text-gray-400">The car owner will review your proposal and get back to you.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📋</span> Issue Description
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {lead.description}
            </p>
          </div>

          {/* Image Gallery */}
          {lead.images && lead.images.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📷</span> Photos ({lead.images.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {lead.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => openLightbox(index)}
                    className="relative aspect-square rounded-xl overflow-hidden group hover:ring-2 hover:ring-[#2ec8c6] transition-all"
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Issue photo ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Proposal Form */}
          {!hasSubmittedProposal && !submitSuccess && lead.status === 'open' && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span>💼</span> Submit Your Proposal
                </h2>
                {!showProposalForm && (
                  <button
                    onClick={() => setShowProposalForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Create Proposal
                  </button>
                )}
              </div>

              {showProposalForm && (
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {submitError}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Estimated Cost ($) *</label>
                      <input
                        type="number"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        placeholder="e.g., 350.00"
                        step="0.01"
                        min="0"
                        className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Estimated Days *</label>
                      <input
                        type="number"
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(e.target.value)}
                        placeholder="e.g., 3"
                        min="1"
                        className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Your Message *
                      <span className={`ml-2 text-xs ${proposalMessage.length < 20 ? 'text-gray-500' : 'text-green-400'}`}>
                        ({proposalMessage.length}/20 min)
                      </span>
                    </label>
                    <textarea
                      value={proposalMessage}
                      onChange={(e) => setProposalMessage(e.target.value)}
                      placeholder="Describe your approach, experience with this type of repair, and what's included in your quote..."
                      rows={5}
                      minLength={20}
                      className={`w-full glass rounded-lg px-4 py-3 bg-transparent border focus:outline-none transition-colors resize-none ${
                        proposalMessage.length > 0 && proposalMessage.length < 20
                          ? 'border-yellow-500 focus:border-yellow-500'
                          : 'border-gray-700 focus:border-[#2ec8c6]'
                      }`}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting || proposalMessage.length < 20}
                      className="flex-1 py-3 bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProposalForm(false)}
                      className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Already Submitted Message */}
          {hasSubmittedProposal && (
            <div className="glass rounded-2xl p-6 border border-blue-500/30 bg-blue-500/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold text-blue-400">You&apos;ve Already Submitted a Proposal</p>
                  <p className="text-sm text-gray-400">Wait for the car owner to review your proposal.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>👤</span> Customer
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="font-medium">
                  {lead.user?.first_name} {lead.user?.last_name}
                </p>
              </div>
              {lead.user?.city && (
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-medium">
                    {lead.user.city}{lead.user.state ? `, ${lead.user.state}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>🚗</span> Vehicle
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Make & Model</p>
                <p className="font-medium">{lead.car_make} {lead.car_model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Year</p>
                <p className="font-medium">{lead.car_year}</p>
              </div>
            </div>
          </div>

          {/* Lead Stats */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> Lead Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Posted</p>
                <p className="font-medium">
                  {new Date(lead.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Proposals</p>
                <p className="font-medium">{lead.proposal_count || lead.proposals?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {!hasSubmittedProposal && !submitSuccess && lead.status === 'open' && (
            <button
              onClick={() => {
                setShowProposalForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-4 bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <span>💼</span> Submit Proposal
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && lead.images && lead.images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 glass rounded-full hover:bg-white/20 transition-colors text-2xl z-10"
          >
            ✕
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 font-semibold">
            {lightboxIndex + 1} / {lead.images.length}
          </div>

          {/* Navigation arrows */}
          {lead.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 p-3 glass rounded-full hover:bg-white/20 transition-colors text-2xl"
              >
                ←
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 p-3 glass rounded-full hover:bg-white/20 transition-colors text-2xl"
              >
                →
              </button>
            </>
          )}

          {/* Main image */}
          <div 
            className="relative w-full h-full max-w-4xl max-h-[80vh] mx-16 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(lead.images[lightboxIndex])}
              alt={`Issue photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Thumbnail strip */}
          {lead.images.length > 1 && (
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {lead.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden relative transition-all ${
                    index === lightboxIndex 
                      ? 'ring-2 ring-[#2ec8c6] scale-110' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Thumbnail ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

