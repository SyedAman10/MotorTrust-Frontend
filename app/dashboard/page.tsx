'use client';

import { useEffect, useState } from 'react';
import { AuthService, User } from '@/lib/auth';
import { VehicleService, Vehicle } from '@/lib/vehicles';
import { ShopService, RepairLead, Shop } from '@/lib/shops';
import Link from 'next/link';

export default function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [primaryVehicle, setPrimaryVehicle] = useState<Vehicle | null>(null);
  const [leads, setLeads] = useState<RepairLead[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await AuthService.getCurrentUser();
        if (userRes.data) {
          setUser(userRes.data);

          // Load role-specific data
          if (userRes.data.role === 'car_owner') {
            const vehiclesRes = await VehicleService.getVehicles().catch(() => ({ data: [] }));
            if (vehiclesRes.data) {
              // Handle both array and object response formats
              const vehiclesList = Array.isArray(vehiclesRes.data) 
                ? vehiclesRes.data 
                : (vehiclesRes.data as { vehicles?: Vehicle[] }).vehicles || [];
              setVehicles(vehiclesList);
              const primary = vehiclesList.find((v: Vehicle) => v.is_primary);
              if (primary) setPrimaryVehicle(primary);
            }
          } else if (userRes.data.role === 'shop_owner') {
            // Check if shop is set up
            const shopRes = await ShopService.getMyShop().catch(() => ({ data: { shop: null } }));
            if (shopRes.data?.shop) {
              setShop(shopRes.data.shop);
              // Load leads only if shop exists
              const leadsRes = await ShopService.getLeads().catch(() => ({ data: { leads: [] } }));
              if (leadsRes.data?.leads) {
                setLeads(leadsRes.data.leads);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🚗</div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Repair Shop Dashboard
  if (user?.role === 'shop_owner') {
    // If no shop, show setup prompt
    if (!shop) {
      return <ShopSetupPrompt user={user} />;
    }
    return <RepairShopDashboard user={user} leads={leads} shop={shop} />;
  }

  // Consumer Dashboard (default)
  return <ConsumerDashboard user={user} vehicles={vehicles} primaryVehicle={primaryVehicle} />;
}

// Consumer Dashboard Component
function ConsumerDashboard({ 
  user, 
  vehicles: vehiclesProp, 
  primaryVehicle 
}: { 
  user: User | null; 
  vehicles: Vehicle[]; 
  primaryVehicle: Vehicle | null;
}) {
  // Ensure vehicles is always an array
  const vehicles = Array.isArray(vehiclesProp) ? vehiclesProp : [];
  
  const stats = [
    { 
      label: 'Total Vehicles', 
      value: vehicles.length, 
      icon: '🚗', 
      color: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30'
    },
    { 
      label: 'Total Repairs', 
      value: vehicles.reduce((acc, v) => acc + (v.repair_count || 0), 0), 
      icon: '🔧', 
      color: 'from-green-500/20 to-green-600/20',
      border: 'border-green-500/30'
    },
    { 
      label: 'Active Services', 
      value: 0, 
      icon: '⚡', 
      color: 'from-yellow-500/20 to-yellow-600/20',
      border: 'border-yellow-500/30'
    },
    { 
      label: 'Trust Score', 
      value: '95%', 
      icon: '⭐', 
      color: 'from-[#2ec8c6]/20 to-[#1a9a99]/20',
      border: 'border-[#2ec8c6]/30'
    },
  ];

  const quickActions = [
    { icon: '🛠️', title: 'Request Repair', desc: 'Get quotes from shops', href: '/dashboard/requests', color: 'hover:border-green-500/50' },
    { icon: '🚗', title: 'Add Vehicle', desc: 'Register a new vehicle', href: '/dashboard/vehicles?add=true', color: 'hover:border-blue-500/50' },
    { icon: '🔍', title: 'AI Diagnosis', desc: 'Get instant diagnosis', href: '/dashboard/diagnosis', color: 'hover:border-purple-500/50' },
    { icon: '📊', title: 'View Reports', desc: 'Analytics & insights', href: '/dashboard/reports', color: 'hover:border-yellow-500/50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-strong rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2ec8c6]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative">
          <p className="text-[#2ec8c6] font-medium mb-2">Welcome back,</p>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {user?.name}!
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            {vehicles.length === 0 
              ? "Start by adding your first vehicle to unlock the full power of MotorTrust."
              : `You have ${vehicles.length} vehicle${vehicles.length > 1 ? 's' : ''} registered. Keep track of maintenance and get AI-powered insights.`
            }
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`glass rounded-2xl p-6 border ${stat.border} bg-gradient-to-br ${stat.color}`}
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Primary Vehicle & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Primary Vehicle */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Primary Vehicle</h2>
            <Link 
              href="/dashboard/vehicles"
              className="text-[#2ec8c6] text-sm hover:underline"
            >
              View all →
            </Link>
          </div>

          {primaryVehicle ? (
            <Link 
              href={`/dashboard/vehicles/${primaryVehicle.id}`}
              className="block glass rounded-xl p-6 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">🚗</span>
                    <span className="px-2 py-0.5 bg-[#2ec8c6]/20 text-[#2ec8c6] text-xs rounded-full">
                      Primary
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                  </h3>
                  <p className="text-gray-400">{primaryVehicle.vin}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Mileage</div>
                  <div className="text-xl font-bold">{primaryVehicle.mileage?.toLocaleString()} mi</div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex gap-6">
                  <div>
                    <div className="text-sm text-gray-400">Repairs</div>
                    <div className="font-semibold">{primaryVehicle.repair_count || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Last Service</div>
                    <div className="font-semibold">
                      {primaryVehicle.last_service_date 
                        ? new Date(primaryVehicle.last_service_date).toLocaleDateString() 
                        : 'No records'}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-[#2ec8c6] transition-colors">
                  View Details →
                </span>
              </div>
            </Link>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-xl font-bold mb-2">No vehicles yet</h3>
              <p className="text-gray-400 mb-6">Add your first vehicle to get started</p>
              <Link
                href="/dashboard/vehicles?add=true"
                className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-6 py-3 rounded-full transition-all"
              >
                <span>➕</span>
                Add Vehicle
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-strong rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className={`glass rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] border border-transparent ${action.color}`}
              >
                <div className="text-3xl mb-3">{action.icon}</div>
                <div className="font-bold mb-1">{action.title}</div>
                <div className="text-gray-400 text-sm">{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="glass-strong rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6">Tips & Insights</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 border-l-4 border-[#2ec8c6]">
            <div className="flex items-center gap-2 mb-2">
              <span>💡</span>
              <span className="font-semibold text-sm">Pro Tip</span>
            </div>
            <p className="text-sm text-gray-400">
              Regular oil changes every 5,000-7,500 miles can extend your engine life by years.
            </p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 mb-2">
              <span>⚠️</span>
              <span className="font-semibold text-sm">Reminder</span>
            </div>
            <p className="text-sm text-gray-400">
              Check your tire pressure monthly for better fuel efficiency and safety.
            </p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-2">
              <span>✅</span>
              <span className="font-semibold text-sm">Did You Know?</span>
            </div>
            <p className="text-sm text-gray-400">
              MotorTrust AI can predict potential issues before they become costly repairs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shop Setup Prompt Component
function ShopSetupPrompt({ user }: { user: User | null }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-strong rounded-2xl p-12 text-center">
        <div className="text-7xl mb-6">🏪</div>
        <h1 className="text-3xl font-bold gradient-text mb-4">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          To start receiving repair requests and growing your business, you need to set up your shop profile first.
        </p>
        <Link
          href="/dashboard/shop/setup"
          className="inline-flex items-center gap-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105 text-lg"
        >
          <span>🚀</span>
          Set Up My Shop
        </Link>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <h3 className="font-semibold mb-4">What you&apos;ll get:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="glass rounded-xl p-4">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-semibold mb-1">Repair Leads</h4>
              <p className="text-sm text-gray-400">Browse repair requests from car owners in your area</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl mb-2">💼</div>
              <h4 className="font-semibold mb-1">Submit Proposals</h4>
              <p className="text-sm text-gray-400">Send quotes directly to customers</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold mb-1">Grow Revenue</h4>
              <p className="text-sm text-gray-400">Win more jobs and build your reputation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Repair Shop Dashboard Component
function RepairShopDashboard({ 
  user, 
  leads,
  shop 
}: { 
  user: User | null; 
  leads: RepairLead[];
  shop: Shop;
}) {
  const urgentLeads = leads.filter(l => l.urgency === 'urgent' || l.urgency === 'high');

  const stats = [
    { 
      label: 'Available Leads', 
      value: leads.length, 
      icon: '📋', 
      color: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30'
    },
    { 
      label: 'Urgent Leads', 
      value: urgentLeads.length, 
      icon: '🔥', 
      color: 'from-red-500/20 to-red-600/20',
      border: 'border-red-500/30'
    },
    { 
      label: 'Est. Revenue', 
      value: `$${(leads.length * 250).toLocaleString()}`, 
      icon: '💰', 
      color: 'from-green-500/20 to-green-600/20',
      border: 'border-green-500/30'
    },
    { 
      label: 'Rating', 
      value: '4.8 ⭐', 
      icon: '⭐', 
      color: 'from-[#2ec8c6]/20 to-[#1a9a99]/20',
      border: 'border-[#2ec8c6]/30'
    },
  ];

  const quickActions = [
    { icon: '📋', title: 'Browse Leads', desc: 'Find new repair jobs', href: '/dashboard/leads', color: 'hover:border-blue-500/50' },
    { icon: '💼', title: 'My Proposals', desc: 'Track submitted proposals', href: '/dashboard/proposals', color: 'hover:border-green-500/50' },
    { icon: '🔧', title: 'Active Jobs', desc: 'Manage ongoing repairs', href: '/dashboard/jobs', color: 'hover:border-purple-500/50' },
    { icon: '📊', title: 'Reports', desc: 'Analytics & insights', href: '/dashboard/reports', color: 'hover:border-yellow-500/50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-strong rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2ec8c6]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏪</span>
            <span className="text-[#2ec8c6] font-semibold">{shop.shop_name}</span>
            {shop.verification_status === 'approved' && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">✓ Verified</span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Welcome back, {user?.first_name || user?.name}!
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            {leads.length === 0 
              ? "No leads available right now. Check back soon for new repair opportunities!"
              : `You have ${leads.length} available lead${leads.length > 1 ? 's' : ''} waiting. Submit proposals to win more jobs!`
            }
          </p>
        </div>
      </div>

      {/* Urgent Alert */}
      {urgentLeads.length > 0 && (
        <div className="glass-strong rounded-2xl p-6 border border-red-500/30 bg-red-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔥</span>
              <div>
                <h3 className="text-xl font-bold text-red-400">Urgent Leads Available!</h3>
                <p className="text-gray-400">
                  {urgentLeads.length} customer{urgentLeads.length > 1 ? 's need' : ' needs'} immediate assistance
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/leads"
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              View Urgent Leads
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`glass rounded-2xl p-6 border ${stat.border} bg-gradient-to-br ${stat.color}`}
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Leads */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="glass-strong rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className={`glass rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] border border-transparent ${action.color}`}
              >
                <div className="text-3xl mb-3">{action.icon}</div>
                <div className="font-bold mb-1">{action.title}</div>
                <div className="text-gray-400 text-sm">{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Leads</h2>
            <Link 
              href="/dashboard/leads"
              className="text-[#2ec8c6] text-sm hover:underline"
            >
              View all →
            </Link>
          </div>

          {leads.length > 0 ? (
            <div className="space-y-4">
              {leads.slice(0, 3).map((lead) => (
                <Link key={lead.id} href="/dashboard/leads" className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-2xl">
                    🚗
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold line-clamp-1">
                      {lead.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {lead.car_year} {lead.car_make} {lead.car_model}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">{lead.proposal_count || 0} proposals</div>
                    {lead.urgency === 'high' && (
                      <span className="text-xs text-red-400">🔥 Urgent</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 glass rounded-xl">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-400">No leads available right now</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips for Shops */}
      <div className="glass-strong rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6">Tips to Get More Customers</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 border-l-4 border-[#2ec8c6]">
            <div className="flex items-center gap-2 mb-2">
              <span>⚡</span>
              <span className="font-semibold text-sm">Respond Quickly</span>
            </div>
            <p className="text-sm text-gray-400">
              Shops that respond within 1 hour get 3x more jobs on average.
            </p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 mb-2">
              <span>📸</span>
              <span className="font-semibold text-sm">Add Photos</span>
            </div>
            <p className="text-sm text-gray-400">
              Include before/after photos to build trust with customers.
            </p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-2">
              <span>💬</span>
              <span className="font-semibold text-sm">Get Reviews</span>
            </div>
            <p className="text-sm text-gray-400">
              Ask satisfied customers for reviews to improve your rating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
