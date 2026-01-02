'use client';

import { useEffect, useState } from 'react';
import { AuthService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicleCount: number;
  totalSpent: number;
  lastVisit: string;
}

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1234567890',
    vehicleCount: 2,
    totalSpent: 1250,
    lastVisit: '2024-01-18',
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1234567891',
    vehicleCount: 1,
    totalSpent: 450,
    lastVisit: '2024-01-15',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1234567892',
    vehicleCount: 3,
    totalSpent: 2800,
    lastVisit: '2024-01-20',
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">👥</div>
          <p className="text-gray-400">Loading customers...</p>
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
          <h1 className="text-3xl font-bold gradient-text">Customers</h1>
          <p className="text-gray-400 mt-1">Manage your customer relationships</p>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="pl-12 pr-4 py-3 glass rounded-xl bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👥</span>
            <span className="text-gray-400 text-sm">Total Customers</span>
          </div>
          <div className="text-3xl font-bold">{customers.length}</div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🚗</span>
            <span className="text-gray-400 text-sm">Vehicles Serviced</span>
          </div>
          <div className="text-3xl font-bold">
            {customers.reduce((acc, c) => acc + c.vehicleCount, 0)}
          </div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💰</span>
            <span className="text-gray-400 text-sm">Total Revenue</span>
          </div>
          <div className="text-3xl font-bold text-[#2ec8c6]">
            ${customers.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString()}
          </div>
        </div>
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-gray-400 text-sm">Avg per Customer</span>
          </div>
          <div className="text-3xl font-bold">
            ${Math.round(customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length)}
          </div>
        </div>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">👥</div>
          <h2 className="text-2xl font-bold mb-3">No customers found</h2>
          <p className="text-gray-400">
            {searchQuery ? 'Try a different search term' : 'Complete jobs to build your customer base'}
          </p>
        </div>
      ) : (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Vehicles</th>
                  <th className="p-4 font-medium">Total Spent</th>
                  <th className="p-4 font-medium">Last Visit</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2ec8c6] to-[#1a9a99] rounded-full flex items-center justify-center text-lg font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="font-semibold">{customer.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{customer.email}</div>
                        <div className="text-gray-400">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{customer.vehicleCount}</td>
                    <td className="p-4 font-bold text-[#2ec8c6]">${customer.totalSpent}</td>
                    <td className="p-4">
                      {new Date(customer.lastVisit).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 glass rounded-lg hover:bg-white/10 transition-colors text-sm">
                          View
                        </button>
                        <a
                          href={`tel:${customer.phone}`}
                          className="px-3 py-1.5 glass rounded-lg hover:bg-white/10 transition-colors text-sm"
                        >
                          📞
                        </a>
                        <a
                          href={`mailto:${customer.email}`}
                          className="px-3 py-1.5 glass rounded-lg hover:bg-white/10 transition-colors text-sm"
                        >
                          ✉️
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

