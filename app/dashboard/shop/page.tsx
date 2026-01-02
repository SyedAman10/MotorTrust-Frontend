'use client';

import { useEffect, useState } from 'react';
import { ShopService, Shop } from '@/lib/shops';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyShopPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

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
        loadShop();
      }
    } catch (err) {
      console.error('Access check failed:', err);
      router.push('/signup');
    }
  };

  const loadShop = async () => {
    try {
      const response = await ShopService.getMyShop();
      if (response.data?.shop) {
        setShop(response.data.shop);
      } else {
        // No shop yet, redirect to setup
        router.push('/dashboard/shop/setup');
        return;
      }
    } catch (err) {
      console.error('Failed to load shop:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🏪</div>
          <p className="text-gray-400">Loading your shop...</p>
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

  if (!shop) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold mb-2">No Shop Found</h2>
        <p className="text-gray-400 mb-6">You haven&apos;t set up your shop yet.</p>
        <Link
          href="/dashboard/shop/setup"
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all"
        >
          Set Up My Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Shop</h1>
          <p className="text-gray-400 mt-1">Manage your shop profile and settings</p>
        </div>
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all"
        >
          <span>📋</span>
          Browse Leads
        </Link>
      </div>

      {/* Shop Card */}
      <div className="glass-strong rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            🏪
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold">{shop.shop_name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(shop.verification_status)}`}>
                {shop.verification_status === 'approved' ? '✓ Verified' : shop.verification_status}
              </span>
              {shop.is_active && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-2 text-gray-400">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{shop.shop_address}</span>
              </div>
              {shop.phone_number && (
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{shop.phone_number}</span>
                </div>
              )}
            </div>

            {shop.shop_description && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-gray-400">{shop.shop_description}</p>
              </div>
            )}

            {shop.specialities && shop.specialities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="font-semibold mb-3">Specialities</h3>
                <div className="flex flex-wrap gap-2">
                  {shop.specialities.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1 glass rounded-full text-sm capitalize"
                    >
                      {spec.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/leads"
          className="glass-strong rounded-2xl p-6 hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-bold mb-1">Browse Leads</h3>
          <p className="text-gray-400 text-sm">Find new repair opportunities</p>
        </Link>
        <Link
          href="/dashboard/proposals"
          className="glass-strong rounded-2xl p-6 hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl mb-3">💼</div>
          <h3 className="font-bold mb-1">My Proposals</h3>
          <p className="text-gray-400 text-sm">Track your submitted quotes</p>
        </Link>
        <Link
          href="/dashboard/jobs"
          className="glass-strong rounded-2xl p-6 hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl mb-3">🔧</div>
          <h3 className="font-bold mb-1">Active Jobs</h3>
          <p className="text-gray-400 text-sm">Manage ongoing repairs</p>
        </Link>
      </div>

      {/* Tips */}
      <div className="glass-strong rounded-2xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span>💡</span>
          Tips to Get More Customers
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 border-l-4 border-[#2ec8c6]">
            <p className="font-semibold text-sm mb-1">Respond Quickly</p>
            <p className="text-gray-400 text-sm">
              Fast responses get 3x more jobs
            </p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-yellow-500">
            <p className="font-semibold text-sm mb-1">Competitive Pricing</p>
            <p className="text-gray-400 text-sm">
              Fair quotes win more customers
            </p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-green-500">
            <p className="font-semibold text-sm mb-1">Build Trust</p>
            <p className="text-gray-400 text-sm">
              Great service leads to reviews
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

