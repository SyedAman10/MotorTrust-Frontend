'use client';

import { useEffect, useState, useMemo } from 'react';
import { AuthService, TokenManager, User, UserRole } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarItem {
  icon: string;
  label: string;
  href: string;
  roles?: UserRole[];
}

const allSidebarItems: SidebarItem[] = [
  { icon: '🏠', label: 'Overview', href: '/dashboard' },
  // Car owner items
  { icon: '🚗', label: 'My Vehicles', href: '/dashboard/vehicles', roles: ['car_owner'] },
  { icon: '🛠️', label: 'Request Repair', href: '/dashboard/requests', roles: ['car_owner'] },
  { icon: '📜', label: 'Repair History', href: '/dashboard/repairs', roles: ['car_owner'] },
  { icon: '🔍', label: 'AI Diagnosis', href: '/dashboard/diagnosis', roles: ['car_owner'] },
  { icon: '🏪', label: 'Find Shops', href: '/dashboard/shops', roles: ['car_owner'] },
  // Shop owner items
  { icon: '🏪', label: 'My Shop', href: '/dashboard/shop', roles: ['shop_owner'] },
  { icon: '📋', label: 'Browse Leads', href: '/dashboard/leads', roles: ['shop_owner'] },
  { icon: '💼', label: 'My Proposals', href: '/dashboard/proposals', roles: ['shop_owner'] },
  { icon: '🔧', label: 'Active Jobs', href: '/dashboard/jobs', roles: ['shop_owner'] },
  { icon: '👥', label: 'Customers', href: '/dashboard/customers', roles: ['shop_owner'] },
  // Insurance company items
  { icon: '📄', label: 'Claims', href: '/dashboard/claims', roles: ['insurance_company'] },
  { icon: '🔍', label: 'Verify Repairs', href: '/dashboard/verify', roles: ['insurance_company'] },
  { icon: '👥', label: 'Policyholders', href: '/dashboard/policyholders', roles: ['insurance_company'] },
  // Common items
  { icon: '📊', label: 'Reports', href: '/dashboard/reports' },
  { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!TokenManager.isAuthenticated()) {
          router.push('/signup');
          return;
        }

        const response = await AuthService.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        TokenManager.removeToken();
        router.push('/signup');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      TokenManager.removeToken();
      router.push('/');
    }
  };

  // Filter sidebar items based on user role
  const sidebarItems = useMemo(() => {
    if (!user) return allSidebarItems.filter(item => !item.roles);
    
    return allSidebarItems.filter(item => {
      // Show items with no role restriction
      if (!item.roles) return true;
      // Show items that include the user's role
      return item.roles.includes(user.role);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🚗</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#2ec8c6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#2ec8c6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#2ec8c6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#2ec8c6] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2ec8c6] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-[#2ec8c6] rounded-full opacity-[0.02] blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 glass-strong border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2ec8c6] to-[#1a9a99] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#2ec8c6]/20">
                🚗
              </div>
              <div>
                <span className="text-xl font-bold gradient-text">MotorTrust</span>
                <p className="text-xs text-gray-500">Vehicle Management</p>
              </div>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 mx-4 mt-4 glass rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2ec8c6] to-[#1a9a99] rounded-full flex items-center justify-center text-lg font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-[#2ec8c6] capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-[#2ec8c6]/20 text-[#2ec8c6] border border-[#2ec8c6]/30' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-[#2ec8c6] rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page title - can be customized per page */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold">
                {pathname === '/dashboard' && 'Dashboard Overview'}
                {pathname === '/dashboard/vehicles' && 'My Vehicles'}
                {pathname?.startsWith('/dashboard/vehicles/') && 'Vehicle Details'}
                {pathname === '/dashboard/requests' && 'Request Repair'}
                {pathname?.startsWith('/dashboard/requests/') && 'Request Details'}
                {pathname === '/dashboard/repairs' && 'Repair History'}
                {pathname?.startsWith('/dashboard/repairs/') && 'Repair Details'}
                {pathname === '/dashboard/diagnosis' && 'AI Diagnosis'}
                {pathname === '/dashboard/shops' && 'Find Repair Shops'}
                {pathname === '/dashboard/shop' && 'My Shop'}
                {pathname === '/dashboard/shop/setup' && 'Shop Setup'}
                {pathname === '/dashboard/leads' && 'Browse Leads'}
                {pathname?.startsWith('/dashboard/leads/') && 'Lead Details'}
                {pathname === '/dashboard/proposals' && 'My Proposals'}
                {pathname === '/dashboard/jobs' && 'Active Jobs'}
                {pathname === '/dashboard/customers' && 'Customers'}
                {pathname === '/dashboard/reports' && 'Reports & Analytics'}
                {pathname === '/dashboard/settings' && 'Settings'}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#2ec8c6] rounded-full"></span>
              </button>

              {/* User avatar (mobile) */}
              <div className="lg:hidden w-10 h-10 bg-gradient-to-br from-[#2ec8c6] to-[#1a9a99] rounded-full flex items-center justify-center text-lg font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}

