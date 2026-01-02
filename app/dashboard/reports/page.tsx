'use client';

import { useEffect, useState } from 'react';
import { RepairService, Repair, RepairStats, ServiceReminder } from '@/lib/repairs';
import { VehicleService, Vehicle } from '@/lib/vehicles';
import Link from 'next/link';

export default function ReportsPage() {
  const [stats, setStats] = useState<RepairStats | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterByPeriod();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      const [statsRes, repairsRes, vehiclesRes, remindersRes] = await Promise.all([
        RepairService.getStats().catch(() => null),
        RepairService.getRepairs().catch(() => ({ data: [] })),
        VehicleService.getVehicles().catch(() => ({ data: [] })),
        RepairService.getReminders().catch(() => ({ data: [] })),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (repairsRes?.data) {
        const repairsList = Array.isArray(repairsRes.data) ? repairsRes.data : [];
        setRepairs(repairsList);
      }
      if (vehiclesRes?.data) {
        const vehiclesList = Array.isArray(vehiclesRes.data) 
          ? vehiclesRes.data 
          : (vehiclesRes.data as { vehicles?: typeof vehicles }).vehicles || [];
        setVehicles(vehiclesList);
      }
      if (remindersRes?.data) {
        const remindersList = Array.isArray(remindersRes.data) ? remindersRes.data : [];
        setReminders(remindersList);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByPeriod = async () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(2000, 0, 1);
    }

    const start = startDate.toISOString().split('T')[0];
    const end = now.toISOString().split('T')[0];

    setDateRange({ start, end });

    try {
      const response = await RepairService.getRepairsByDateRange(start, end);
      if (response.data) {
        setRepairs(response.data);
      }
    } catch (err) {
      console.error('Failed to filter:', err);
    }
  };

  const periods = [
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  // Calculate period stats from filtered repairs
  const periodTotal = repairs.reduce((acc, r) => acc + parseFloat(r.total_cost), 0);
  const periodCount = repairs.length;
  const avgCost = periodCount > 0 ? periodTotal / periodCount : 0;

  // Get expense by category
  const categoryExpenses = repairs.reduce((acc, repair) => {
    const type = repair.service_type || 'Other';
    acc[type] = (acc[type] || 0) + parseFloat(repair.total_cost);
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Monthly breakdown
  const monthlyExpenses = repairs.reduce((acc, repair) => {
    const date = new Date(repair.service_date);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + parseFloat(repair.total_cost);
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">📊</div>
          <p className="text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Reports & Analytics</h1>
          <p className="text-gray-400 mt-1">Track your vehicle expenses and maintenance history</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedPeriod === period.value
                  ? 'bg-[#2ec8c6] text-black font-semibold'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💰</span>
            {stats && periodTotal > parseFloat(stats.avg_repair_cost) * periodCount * 0.9 && (
              <span className="text-sm px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                High
              </span>
            )}
          </div>
          <div className="text-3xl font-bold mb-1">${periodTotal.toFixed(2)}</div>
          <div className="text-gray-400 text-sm">Total Spent</div>
        </div>
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">🔧</span>
            <span className="text-sm px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              {periodCount}
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">{periodCount}</div>
          <div className="text-gray-400 text-sm">Repairs Done</div>
        </div>
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <div className="text-3xl font-bold mb-1">${avgCost.toFixed(2)}</div>
          <div className="text-gray-400 text-sm">Avg. Repair Cost</div>
        </div>
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">🚗</span>
          </div>
          <div className="text-3xl font-bold mb-1">{vehicles.length}</div>
          <div className="text-gray-400 text-sm">Vehicles</div>
        </div>
      </div>

      {/* Service Reminders */}
      {reminders.length > 0 && (
        <div className="glass-strong rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-xl font-bold">Service Reminders</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.map((reminder) => (
              <div key={reminder.vehicle_id} className="glass rounded-xl p-4">
                <div className="font-bold mb-1">
                  {reminder.year} {reminder.make} {reminder.model}
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Current: {reminder.current_mileage?.toLocaleString()} mi</div>
                  {reminder.last_service_date && (
                    <div>Last service: {new Date(reminder.last_service_date).toLocaleDateString()}</div>
                  )}
                  {reminder.last_service_mileage && (
                    <div>Miles since service: {(reminder.current_mileage - reminder.last_service_mileage).toLocaleString()}</div>
                  )}
                </div>
                <Link
                  href={`/dashboard/repairs?add=true&vehicle=${reminder.vehicle_id}`}
                  className="mt-3 block text-center py-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-semibold rounded-lg transition-colors"
                >
                  Schedule Service
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Expenses */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Expenses</h3>
          {Object.keys(monthlyExpenses).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(monthlyExpenses)
                .slice(-6)
                .map(([month, amount]) => {
                  const maxAmount = Math.max(...Object.values(monthlyExpenses));
                  const percentage = (amount / maxAmount) * 100;
                  return (
                    <div key={month}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{month}</span>
                        <span className="font-semibold">${amount.toFixed(2)}</span>
                      </div>
                      <div className="h-3 glass rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📈</div>
              <p>No expense data yet</p>
            </div>
          )}
        </div>

        {/* Expense by Category */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Expense by Category</h3>
          {sortedCategories.length > 0 ? (
            <div className="space-y-3">
              {sortedCategories.map(([category, amount], idx) => {
                const percentage = (amount / periodTotal) * 100;
                const colors = [
                  'bg-[#2ec8c6]',
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-yellow-500',
                  'bg-green-500',
                  'bg-red-500',
                ];
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category}</span>
                      <span className="font-semibold">
                        ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 glass rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🥧</div>
              <p>No category data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* All-Time Stats */}
      {stats && (
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">All-Time Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#2ec8c6]">{stats.total_repairs}</div>
              <div className="text-sm text-gray-400">Total Repairs</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#2ec8c6]">${stats.total_spent}</div>
              <div className="text-sm text-gray-400">Total Spent</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">${stats.avg_repair_cost}</div>
              <div className="text-sm text-gray-400">Avg Cost</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{stats.vehicles_serviced}</div>
              <div className="text-sm text-gray-400">Vehicles Serviced</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{stats.shops_used}</div>
              <div className="text-sm text-gray-400">Shops Used</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">
                {stats.last_service_date 
                  ? new Date(stats.last_service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—'}
              </div>
              <div className="text-sm text-gray-400">Last Service</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Expenses</h3>
          <Link href="/dashboard/repairs" className="text-[#2ec8c6] hover:underline text-sm">
            View All →
          </Link>
        </div>
        {repairs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Vehicle</th>
                  <th className="pb-4 font-medium">Service</th>
                  <th className="pb-4 font-medium">Shop</th>
                  <th className="pb-4 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {repairs.slice(0, 10).map((repair) => (
                  <tr key={repair.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="py-4">{new Date(repair.service_date).toLocaleDateString()}</td>
                    <td className="py-4 text-gray-400">
                      {repair.year} {repair.make} {repair.model}
                    </td>
                    <td className="py-4 font-medium">{repair.service_type}</td>
                    <td className="py-4 text-gray-400">{repair.shop_name || '—'}</td>
                    <td className="py-4 text-right font-bold text-[#2ec8c6]">${repair.total_cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>No expenses recorded yet</p>
            <Link
              href="/dashboard/repairs?add=true"
              className="inline-block mt-4 px-4 py-2 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-semibold rounded-lg transition-colors"
            >
              Add First Repair
            </Link>
          </div>
        )}
      </div>

      {/* Export */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Export Reports</h3>
            <p className="text-gray-400 text-sm">Download your vehicle history and expense reports</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
              <span>📄</span> PDF
            </button>
            <button className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
              <span>📊</span> Excel
            </button>
            <button className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
              <span>🖨️</span> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
