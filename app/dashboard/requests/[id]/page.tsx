'use client';

import { useEffect, useState, use, useRef, useCallback } from 'react';
import { ShopService, RepairLead, Proposal, getImageUrl } from '@/lib/shops';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [lead, setLead] = useState<RepairLead | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Image lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Prevent double-fetch in React 18 StrictMode
  const hasFetched = useRef(false);

  const loadLead = useCallback(async () => {
    try {
      const response = await ShopService.getLead(parseInt(resolvedParams.id));
      if (response.data) {
        setLead(response.data.lead);
        setProposals(response.data.proposals || []);
      }
    } catch (err) {
      console.error('Failed to load lead:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const checkAccess = async () => {
      try {
        const response = await AuthService.getCurrentUser();
        if (response.data) {
          setUser(response.data);
          loadLead();
        }
      } catch (err) {
        console.error('Access check failed:', err);
        router.push('/signup');
      }
    };

    checkAccess();
  }, [router, loadLead]);

  const handleAccept = async (proposalId: number) => {
    setAccepting(proposalId);
    setError('');
    try {
      await ShopService.acceptProposal(proposalId);
      setSuccess('Proposal accepted! The shop will contact you shortly.');
      // Reload data
      loadLead();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept proposal';
      setError(errorMessage);
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (proposalId: number) => {
    setRejecting(proposalId);
    setError('');
    try {
      await ShopService.rejectProposal(proposalId);
      // Update local state
      setProposals(proposals.map(p => 
        p.id === proposalId ? { ...p, status: 'rejected' } : p
      ) as Proposal[]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject proposal';
      setError(errorMessage);
    } finally {
      setRejecting(null);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lead?.images) return;
    const total = lead.images.length;
    if (direction === 'prev') {
      setLightboxIndex((lightboxIndex - 1 + total) % total);
    } else {
      setLightboxIndex((lightboxIndex + 1) % total);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
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

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🔧</div>
          <p className="text-gray-400">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-2">Request Not Found</h2>
        <p className="text-gray-400 mb-6">This repair request doesn&apos;t exist or you don&apos;t have access.</p>
        <Link
          href="/dashboard/requests"
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all"
        >
          ← Back to Requests
        </Link>
      </div>
    );
  }

  const acceptedProposal = proposals.find(p => p.status === 'accepted');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/requests"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        ← Back to My Requests
      </Link>

      {/* Success/Error Messages */}
      {success && (
        <div className="glass rounded-xl p-4 border border-green-500/30 bg-green-500/10 text-green-400 flex items-center gap-3">
          <span className="text-xl">✅</span>
          {success}
        </div>
      )}
      {error && (
        <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10 text-red-400 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          {error}
        </div>
      )}

      {/* Request Details */}
      <div className="glass-strong rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
            🚗
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold">{lead.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(lead.status)}`}>
                {lead.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getUrgencyColor(lead.urgency)}`}>
                {lead.urgency} urgency
              </span>
            </div>
            <p className="text-xl text-gray-300 mb-4">
              {lead.car_year} {lead.car_make} {lead.car_model}
            </p>
            <div className="glass rounded-lg p-4 bg-black/20">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-400 whitespace-pre-wrap">{lead.description}</p>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {lead.images && lead.images.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>📷</span>
              Photos ({lead.images.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {lead.images.map((image, index) => {
                const imageUrl = getImageUrl(image);
                return (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className="relative aspect-square rounded-xl overflow-hidden group hover:ring-2 hover:ring-[#2ec8c6] transition-all"
                >
                  {/* Using img tag to avoid CORS issues with external API images */}
                  <img
                    src={imageUrl}
                    alt={`Issue photo ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                  </div>
                </button>
              )})}
            </div>
          </div>
        )}
      </div>

      {/* Proposals Section */}
      <div className="glass-strong rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span>💬</span>
            Proposals
            <span className="text-[#2ec8c6]">({proposals.length})</span>
          </h2>
        </div>

        {acceptedProposal && (
          <div className="mb-6 p-6 glass rounded-xl border-2 border-green-500/50 bg-green-500/10">
            <div className="flex items-center gap-2 text-green-400 font-bold mb-3">
              <span>✅</span>
              Accepted Proposal
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold">{acceptedProposal.shop?.shop_name || 'Repair Shop'}</h3>
                <p className="text-gray-400 mt-2">{acceptedProposal.message}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  ${parseFloat(String(acceptedProposal.estimated_cost || 0)).toFixed(2)}
                </div>
                {acceptedProposal.estimated_duration && (
                  <div className="text-gray-400 text-sm mt-1">
                    Est. {acceptedProposal.estimated_duration}
                  </div>
                )}
                {acceptedProposal.warranty_period && (
                  <div className="text-gray-400 text-sm">
                    Warranty: {acceptedProposal.warranty_period}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💭</div>
            <h3 className="text-xl font-bold mb-2">No proposals yet</h3>
            <p className="text-gray-400">
              Repair shops are reviewing your request. You&apos;ll receive proposals soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.filter(p => p.id !== acceptedProposal?.id).map((proposal) => (
              <div
                key={proposal.id}
                className={`glass rounded-xl p-6 border ${
                  proposal.status === 'rejected' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🏪
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">
                        {proposal.shop?.shop_name || 'Repair Shop'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getProposalStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      {proposal.shop?.rating && (
                        <span className="text-yellow-400 text-sm">
                          ⭐ {proposal.shop.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-4">{proposal.message}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {proposal.estimated_duration && (
                        <span className="glass px-3 py-1 rounded-full">
                          ⏱️ {proposal.estimated_duration}
                        </span>
                      )}
                      {proposal.warranty_period && (
                        <span className="glass px-3 py-1 rounded-full">
                          🛡️ {proposal.warranty_period}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#2ec8c6]">
                        ${parseFloat(String(proposal.estimated_cost || 0)).toFixed(2)}
                      </div>
                      <div className="text-gray-500 text-sm">estimated cost</div>
                    </div>

                    {user?.role === 'car_owner' && proposal.status === 'pending' && !acceptedProposal && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(proposal.id)}
                          disabled={rejecting === proposal.id}
                          className="px-4 py-2 glass rounded-lg hover:bg-red-500/20 text-red-400 transition-colors text-sm font-semibold disabled:opacity-50"
                        >
                          {rejecting === proposal.id ? '...' : 'Reject'}
                        </button>
                        <button
                          onClick={() => handleAccept(proposal.id)}
                          disabled={accepting === proposal.id}
                          className="px-4 py-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
                        >
                          {accepting === proposal.id ? 'Accepting...' : 'Accept'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && lead.images && lead.images.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
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
          <div className="absolute top-4 left-4 glass rounded-full px-4 py-2 text-sm">
            {lightboxIndex + 1} / {lead.images.length}
          </div>

          {/* Navigation arrows */}
          {lead.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                className="absolute left-4 p-3 glass rounded-full hover:bg-white/20 transition-colors text-2xl"
              >
                ←
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
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
