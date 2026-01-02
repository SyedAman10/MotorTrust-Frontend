'use client';

import { useEffect, useState } from 'react';
import { AuthService, User } from '@/lib/auth';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await AuthService.getCurrentUser();
        if (response.data) setUser(response.data);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">⚙️</div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#2ec8c6] text-black font-semibold'
                : 'glass hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-strong rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Profile Information</h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#2ec8c6] to-[#1a9a99] rounded-full flex items-center justify-center text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{user?.name}</h3>
              <p className="text-[#2ec8c6] capitalize">{user?.role?.replace('_', ' ')}</p>
              <button className="mt-2 text-sm text-gray-400 hover:text-white transition-colors">
                Change photo →
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={user?.phone_number || ''}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <input
                  type="text"
                  value={user?.role?.replace('_', ' ') || ''}
                  disabled
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 opacity-50 cursor-not-allowed capitalize"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Address</label>
              <input
                type="text"
                defaultValue={user?.address || ''}
                className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">City</label>
                <input
                  type="text"
                  defaultValue={user?.city || ''}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">State</label>
                <input
                  type="text"
                  defaultValue={user?.state || ''}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">ZIP Code</label>
                <input
                  type="text"
                  defaultValue={user?.zip_code || ''}
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-4">
              <button className="px-6 py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="glass-strong rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'Email notifications', desc: 'Receive updates via email', enabled: true },
              { label: 'Service reminders', desc: 'Get notified about upcoming maintenance', enabled: true },
              { label: 'Marketing emails', desc: 'Receive promotional offers', enabled: false },
              { label: 'Security alerts', desc: 'Important account security updates', enabled: true },
            ].map((setting, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 glass rounded-lg">
                <div>
                  <div className="font-semibold">{setting.label}</div>
                  <div className="text-sm text-gray-400">{setting.desc}</div>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    setting.enabled ? 'bg-[#2ec8c6]' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="glass-strong rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-semibold mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full glass rounded-lg px-4 py-3 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                />
              </div>
              <button className="px-6 py-3 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold rounded-lg transition-all">
                Update Password
              </button>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6">Two-Factor Authentication</h2>
            <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
            <button className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-colors font-semibold">
              Enable 2FA
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="glass-strong rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">App Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div>
                <div className="font-semibold">Distance Unit</div>
                <div className="text-sm text-gray-400">Choose your preferred unit</div>
              </div>
              <select className="glass rounded-lg px-4 py-2 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none">
                <option value="miles" className="bg-black">Miles</option>
                <option value="km" className="bg-black">Kilometers</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div>
                <div className="font-semibold">Currency</div>
                <div className="text-sm text-gray-400">Choose your preferred currency</div>
              </div>
              <select className="glass rounded-lg px-4 py-2 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none">
                <option value="usd" className="bg-black">USD ($)</option>
                <option value="eur" className="bg-black">EUR (€)</option>
                <option value="gbp" className="bg-black">GBP (£)</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div>
                <div className="font-semibold">Date Format</div>
                <div className="text-sm text-gray-400">Choose your preferred date format</div>
              </div>
              <select className="glass rounded-lg px-4 py-2 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none">
                <option value="mdy" className="bg-black">MM/DD/YYYY</option>
                <option value="dmy" className="bg-black">DD/MM/YYYY</option>
                <option value="ymd" className="bg-black">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="glass-strong rounded-2xl p-8 border border-red-500/30">
        <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-gray-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}

