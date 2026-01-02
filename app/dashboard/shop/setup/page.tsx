'use client';

import { useEffect, useState } from 'react';
import { ShopService, CreateShopRequest } from '@/lib/shops';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const SPECIALITIES = [
  { value: 'brake_repair', label: 'Brake Repair', icon: '🛞' },
  { value: 'engine_repair', label: 'Engine Repair', icon: '🔧' },
  { value: 'oil_change', label: 'Oil Change', icon: '🛢️' },
  { value: 'transmission', label: 'Transmission', icon: '⚙️' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'body_work', label: 'Body Work', icon: '🚗' },
  { value: 'tire_service', label: 'Tire Service', icon: '🔄' },
  { value: 'ac_heating', label: 'AC & Heating', icon: '❄️' },
  { value: 'suspension', label: 'Suspension', icon: '🔩' },
  { value: 'diagnostics', label: 'Diagnostics', icon: '📊' },
];

export default function ShopSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateShopRequest>({
    shop_name: '',
    shop_address: '',
    phone_number: '',
    shop_description: '',
    specialities: [],
  });

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
        // Check if shop already exists
        const shopResponse = await ShopService.getMyShop();
        if (shopResponse.data?.shop) {
          router.push('/dashboard/shop');
          return;
        }
      }
    } catch (err) {
      console.error('Access check failed:', err);
      router.push('/signup');
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeciality = (value: string) => {
    const current = formData.specialities || [];
    if (current.includes(value)) {
      setFormData({ ...formData, specialities: current.filter(s => s !== value) });
    } else {
      setFormData({ ...formData, specialities: [...current, value] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await ShopService.createShop(formData);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create shop';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🏪</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'shop_owner') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-400">Only shop owners can create shops</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Set Up Your Shop</h1>
        <p className="text-gray-400">
          Complete your shop profile to start receiving repair requests
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="glass-strong rounded-2xl p-4 mb-8">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#2ec8c6]">
            <span className="w-6 h-6 bg-[#2ec8c6] text-black rounded-full flex items-center justify-center font-bold text-xs">1</span>
            Create Account
          </div>
          <div className="flex-1 h-0.5 bg-[#2ec8c6] mx-4"></div>
          <div className="flex items-center gap-2 text-[#2ec8c6]">
            <span className="w-6 h-6 bg-[#2ec8c6] text-black rounded-full flex items-center justify-center font-bold text-xs">2</span>
            Shop Details
          </div>
          <div className="flex-1 h-0.5 bg-gray-700 mx-4"></div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center font-bold text-xs">3</span>
            Start Receiving Leads
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass-strong rounded-2xl p-8">
        {error && (
          <div className="mb-6 p-4 glass rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">Shop Name *</label>
            <input
              type="text"
              value={formData.shop_name}
              onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              placeholder="e.g., Auto Fix Pro"
              className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
              required
            />
          </div>

          {/* Shop Address */}
          <div>
            <label className="block text-sm font-semibold mb-2">Shop Address *</label>
            <input
              type="text"
              value={formData.shop_address}
              onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
              placeholder="e.g., 123 Main St, New York, NY 10001"
              className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="e.g., +1234567890"
              className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
            />
          </div>

          {/* Shop Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Shop Description</label>
            <textarea
              value={formData.shop_description}
              onChange={(e) => setFormData({ ...formData, shop_description: e.target.value })}
              placeholder="Tell customers about your shop, experience, and what makes you special..."
              rows={4}
              className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none resize-none"
            />
          </div>

          {/* Specialities */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Specialities <span className="text-gray-500 font-normal">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SPECIALITIES.map((spec) => (
                <button
                  key={spec.value}
                  type="button"
                  onClick={() => toggleSpeciality(spec.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    formData.specialities?.includes(spec.value)
                      ? 'border-[#2ec8c6] bg-[#2ec8c6]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{spec.icon}</span>
                    <span className="text-sm font-medium">{spec.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-xl transition-all disabled:opacity-50 text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating Shop...
                </span>
              ) : (
                'Create My Shop'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="text-center mt-6 text-gray-500 text-sm">
        <p>Your shop will be automatically approved and ready to receive leads!</p>
      </div>
    </div>
  );
}

