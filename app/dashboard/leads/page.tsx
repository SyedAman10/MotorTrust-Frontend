'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ShopService, RepairLead, CreateProposalRequest, getImageUrl } from '@/lib/shops';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RepairLeadsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<RepairLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<RepairLead | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'urgent' | 'high' | 'normal' | 'low'>('all');

  // Proposal form
  const [proposalForm, setProposalForm] = useState<Omit<CreateProposalRequest, 'repair_lead_id'>>({
    message: '',
    estimated_cost: 0,
    estimated_duration: '',
    warranty_period: '',
  });

  // Prevent double-fetch in React 18 StrictMode
  const hasFetched = useRef(false);

  const loadLeads = useCallback(async () => {
    try {
      const response = await ShopService.getLeads(100);
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
          if (response.data.role !== 'shop_owner') {
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

  const openProposalModal = (lead: RepairLead) => {
    setSelectedLead(lead);
    setShowProposalModal(true);
    setProposalForm({
      message: '',
      estimated_cost: 0,
      estimated_duration: '',
      warranty_period: '',
    });
    setError('');
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setSubmitting(true);
    setError('');

    try {
      await ShopService.submitProposal({
        repair_lead_id: selectedLead.id,
        ...proposalForm,
      });
      setSuccess(`Proposal submitted for "${selectedLead.title}"!`);
      setShowProposalModal(false);
      setTimeout(() => setSuccess(''), 5000);
      // Update lead in list to show proposal was submitted
      setLeads(leads.map(l => 
        l.id === selectedLead.id 
          ? { ...l, proposal_count: (l.proposal_count || 0) + 1 }
          : l
      ));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit proposal';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(l => l.urgency === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🔍</div>
          <p className="text-gray-400">Loading repair leads...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'shop_owner') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-400">Only shop owners can access repair leads</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Repair Leads</h1>
          <p className="text-gray-400 mt-1">Browse and submit proposals to repair requests</p>
        </div>
        <Link
          href="/dashboard/proposals"
          className="inline-flex items-center gap-2 glass hover:bg-white/10 px-6 py-3 rounded-full transition-all font-semibold"
        >
          <span>📋</span>
          My Proposals
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="glass rounded-xl p-4 border border-green-500/30 bg-green-500/10 text-green-400 flex items-center gap-3">
          <span className="text-xl">✅</span>
          {success}
        </div>
      )}

      {/* Stats & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="glass-strong rounded-xl px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <div className="text-2xl font-bold">{leads.length}</div>
            <div className="text-sm text-gray-400">Available Leads</div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-400 text-sm">Filter:</span>
          {(['all', 'urgent', 'high', 'normal', 'low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                filter === f 
                  ? 'bg-[#2ec8c6] text-black' 
                  : 'glass hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold mb-3">No repair leads found</h2>
          <p className="text-gray-400">
            {filter !== 'all' 
              ? `No ${filter} urgency leads available. Try a different filter.`
              : 'Check back later for new repair requests from car owners.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="glass-strong rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-all"
            >
              {/* Lead Image or Placeholder */}
              {lead.images && lead.images.length > 0 ? (
                <div className="relative h-40 w-full">
                  <img
                    src={getImageUrl(lead.images[0])}
                    alt={lead.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {lead.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 glass rounded-full px-2 py-1 text-xs font-semibold">
                      +{lead.images.length - 1} more
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(lead.urgency)}`}>
                    {lead.urgency}
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-[#2ec8c6]/10 to-[#1a9a99]/10 flex items-center justify-center relative">
                  <span className="text-4xl">🚗</span>
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(lead.urgency)}`}>
                    {lead.urgency}
                  </div>
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{lead.title}</h3>
                <p className="text-[#2ec8c6] text-sm mb-2">
                  {lead.car_year} {lead.car_make} {lead.car_model}
                </p>
                <p className="text-gray-400 text-sm line-clamp-3 flex-1 mb-4">
                  {lead.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="text-sm">
                    <span className="text-gray-500">By </span>
                    <span className="text-gray-300">
                      {lead.user?.first_name} {lead.user?.last_name?.[0]}.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">
                      {lead.proposal_count || 0} proposals
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="flex-1 py-3 glass rounded-lg text-center font-semibold hover:bg-white/10 transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => openProposalModal(lead)}
                    className="flex-1 py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-all"
                  >
                    Submit Proposal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Proposal Modal */}
      {showProposalModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowProposalModal(false)}
          />
          <div className="relative glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProposalModal(false)}
              className="absolute top-4 right-4 p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold gradient-text mb-2">Submit Proposal</h2>
            <p className="text-gray-400 mb-6">for: {selectedLead.title}</p>

            <div className="glass rounded-lg p-4 mb-6 bg-black/20">
              <div className="text-sm text-gray-400 mb-1">Vehicle</div>
              <div className="font-semibold">
                {selectedLead.car_year} {selectedLead.car_make} {selectedLead.car_model}
              </div>
              <div className="text-sm text-gray-400 mt-3 mb-1">Issue</div>
              <div className="text-gray-300 text-sm">{selectedLead.description}</div>
              
              {/* Issue Photos */}
              {selectedLead.images && selectedLead.images.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">Photos ({selectedLead.images.length})</div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedLead.images.map((image, index) => (
                      <div key={index} className="w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0">
                        <img
                          src={getImageUrl(image)}
                          alt={`Issue photo ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 glass rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitProposal} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Message *</label>
                <textarea
                  value={proposalForm.message}
                  onChange={(e) => setProposalForm({ ...proposalForm, message: e.target.value })}
                  placeholder="Explain what you'll do, why you're the best choice, etc. (minimum 20 characters)"
                  rows={4}
                  className={`w-full glass rounded-lg px-4 py-3 bg-transparent border focus:outline-none resize-none transition-colors ${
                    proposalForm.message.length > 0 && proposalForm.message.length < 20
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-700 focus:border-[#2ec8c6]'
                  }`}
                  required
                  minLength={20}
                />
                <div className="flex justify-between mt-1">
                  <p className={`text-xs ${
                    proposalForm.message.length > 0 && proposalForm.message.length < 20
                      ? 'text-red-400'
                      : 'text-gray-500'
                  }`}>
                    {proposalForm.message.length < 20 
                      ? `Minimum 20 characters (${20 - proposalForm.message.length} more needed)`
                      : '✓ Minimum length met'
                    }
                  </p>
                  <p className="text-xs text-gray-500">{proposalForm.message.length} / 20+</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Estimated Cost ($) *</label>
                  <input
                    type="number"
                    value={proposalForm.estimated_cost || ''}
                    onChange={(e) => setProposalForm({ ...proposalForm, estimated_cost: parseFloat(e.target.value) || 0 })}
                    placeholder="150.00"
                    min={0}
                    step={0.01}
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Duration</label>
                  <input
                    type="text"
                    value={proposalForm.estimated_duration}
                    onChange={(e) => setProposalForm({ ...proposalForm, estimated_duration: e.target.value })}
                    placeholder="e.g., 2-3 hours"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Warranty</label>
                  <input
                    type="text"
                    value={proposalForm.warranty_period}
                    onChange={(e) => setProposalForm({ ...proposalForm, warranty_period: e.target.value })}
                    placeholder="e.g., 6 months"
                    className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="flex-1 py-3 glass rounded-lg hover:bg-white/10 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
