'use client';

import { useEffect, useState } from 'react';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Job {
  id: number;
  vehicleInfo: string;
  serviceType: string;
  customerName: string;
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate: string;
  estimatedCost: number;
}

const mockJobs: Job[] = [
  {
    id: 1,
    vehicleInfo: '2022 Toyota Camry',
    serviceType: 'Brake Repair',
    customerName: 'John Smith',
    status: 'in_progress',
    scheduledDate: '2024-01-20',
    estimatedCost: 350,
  },
  {
    id: 2,
    vehicleInfo: '2021 Honda Accord',
    serviceType: 'Oil Change',
    customerName: 'Jane Doe',
    status: 'pending',
    scheduledDate: '2024-01-22',
    estimatedCost: 75,
  },
  {
    id: 3,
    vehicleInfo: '2020 Ford F-150',
    serviceType: 'Transmission Service',
    customerName: 'Mike Johnson',
    status: 'completed',
    scheduledDate: '2024-01-18',
    estimatedCost: 500,
  },
];

export default function JobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs] = useState<Job[]>(mockJobs);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
      }
    } catch (err) {
      console.error('Access check failed:', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredJobs = jobs.filter(job => 
    statusFilter === 'all' || job.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🔧</div>
          <p className="text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'shop_owner') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-400">Only repair shops can access this page</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Jobs</h1>
          <p className="text-gray-400 mt-1">Manage your active and completed repair jobs</p>
        </div>
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all"
        >
          <span>📋</span>
          Find New Leads
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📋</span>
            <span className="text-gray-400 text-sm">Total Jobs</span>
          </div>
          <div className="text-3xl font-bold">{jobs.length}</div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⏳</span>
            <span className="text-gray-400 text-sm">Pending</span>
          </div>
          <div className="text-3xl font-bold text-gray-400">
            {jobs.filter(j => j.status === 'pending').length}
          </div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔧</span>
            <span className="text-gray-400 text-sm">In Progress</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {jobs.filter(j => j.status === 'in_progress').length}
          </div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-gray-400 text-sm">Completed</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {jobs.filter(j => j.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
              statusFilter === status
                ? 'bg-[#2ec8c6] text-black'
                : 'glass hover:bg-white/10'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🔧</div>
          <h2 className="text-2xl font-bold mb-3">No jobs found</h2>
          <p className="text-gray-400 mb-6">Claim leads to start getting jobs</p>
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all"
          >
            Browse Leads
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-strong rounded-2xl p-6 hover:scale-[1.01] transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-2xl">
                    🚗
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{job.vehicleInfo}</h3>
                    <p className="text-gray-400">{job.serviceType}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Customer</div>
                    <div className="font-semibold">{job.customerName}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Scheduled</div>
                    <div className="font-semibold">
                      {new Date(job.scheduledDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Estimate</div>
                    <div className="font-semibold text-[#2ec8c6]">${job.estimatedCost}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors">
                    View
                  </button>
                  {job.status !== 'completed' && (
                    <button className="px-4 py-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-semibold rounded-lg transition-colors">
                      Update
                    </button>
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

