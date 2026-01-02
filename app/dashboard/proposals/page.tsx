'use client';

import { useEffect, useState } from 'react';
import { ShopService, Proposal } from '@/lib/shops';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ExtendedProposal extends Proposal {
  repair_lead?: {
    id: number;
    title: string;
    car_make: string;
    car_model: string;
    car_year: number;
    status: string;
    user?: {
      first_name: string;
      last_name: string;
      phone?: string;
      email?: string;
    };
  };
}

export default function MyProposalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [proposals, setProposals] = useState<ExtendedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const response = await AuthService.getCurrentUser();
      if (response.data) {
        setUser(response.data);
        if (response.data.role !== 'shop_owner') {
          router.push('/dashboard');
          return;
        }
        loadProposals();
      }
    } catch (err) {
      console.error('Access check failed:', err);
      router.push('/signup');
    }
  };

  const loadProposals = async () => {
    try {
      const response = await ShopService.getMyProposals();
      if (response.data?.proposals) {
        setProposals(response.data.proposals as ExtendedProposal[]);
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      default: return '⏳';
    }
  };

  const filteredProposals = filter === 'all' 
    ? proposals 
    : proposals.filter(p => p.status === filter);

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">📋</div>
          <p className="text-gray-400">Loading your proposals...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'shop_owner') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-400">Only shop owners can access this page</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Proposals</h1>
          <p className="text-gray-400 mt-1">Track your submitted proposals and responses</p>
        </div>
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all"
        >
          <span>🔍</span>
          Browse Leads
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📋</span>
            <span className="text-gray-400 text-sm">Total Proposals</span>
          </div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⏳</span>
            <span className="text-gray-400 text-sm">Pending</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-gray-400 text-sm">Accepted</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.accepted}</div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">❌</span>
            <span className="text-gray-400 text-sm">Rejected</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Filter:</span>
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              filter === f 
                ? 'bg-[#2ec8c6] text-black' 
                : 'glass hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">📋</div>
          <h2 className="text-2xl font-bold mb-3">
            {filter === 'all' ? 'No proposals yet' : `No ${filter} proposals`}
          </h2>
          <p className="text-gray-400 mb-8">
            {filter === 'all' 
              ? 'Start browsing repair leads and submit your first proposal!'
              : 'Try a different filter to see other proposals.'}
          </p>
          {filter === 'all' && (
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-8 py-4 rounded-full transition-all"
            >
              <span>🔍</span>
              Browse Available Leads
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`glass-strong rounded-2xl p-6 ${
                proposal.status === 'rejected' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-2xl">
                  {getStatusIcon(proposal.status)}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">
                      {proposal.repair_lead?.title || `Proposal #${proposal.id}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </div>

                  {proposal.repair_lead && (
                    <p className="text-[#2ec8c6] text-sm mb-2">
                      {proposal.repair_lead.car_year} {proposal.repair_lead.car_make} {proposal.repair_lead.car_model}
                    </p>
                  )}

                  <p className="text-gray-400 mb-4 line-clamp-2">{proposal.message}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="glass px-3 py-1 rounded-full flex items-center gap-2">
                      💰 ${parseFloat(String(proposal.estimated_cost || 0)).toFixed(2)}
                    </span>
                    {proposal.estimated_duration && (
                      <span className="glass px-3 py-1 rounded-full flex items-center gap-2">
                        ⏱️ {proposal.estimated_duration}
                      </span>
                    )}
                    {proposal.warranty_period && (
                      <span className="glass px-3 py-1 rounded-full flex items-center gap-2">
                        🛡️ {proposal.warranty_period}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {proposal.status === 'accepted' && proposal.repair_lead?.user && (
                    <div className="glass rounded-lg p-4 bg-green-500/10 border border-green-500/30 text-left">
                      <div className="text-green-400 font-semibold mb-2">Customer Contact</div>
                      <div className="text-sm space-y-1">
                        <div>
                          👤 {proposal.repair_lead.user.first_name} {proposal.repair_lead.user.last_name}
                        </div>
                        {proposal.repair_lead.user.phone && (
                          <div>📞 {proposal.repair_lead.user.phone}</div>
                        )}
                        {proposal.repair_lead.user.email && (
                          <div className="text-xs text-gray-400">✉️ {proposal.repair_lead.user.email}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {proposal.status === 'pending' && (
                    <div className="text-gray-400 text-sm">
                      Awaiting response...
                    </div>
                  )}

                  {proposal.status === 'rejected' && (
                    <div className="text-red-400 text-sm">
                      Not selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

