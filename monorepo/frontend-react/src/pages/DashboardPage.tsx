/**
 * Admin dashboard — key platform statistics.
 */

import { useEffect, useState } from 'react';
import { fetchDashboard, fetchDashboardTrends } from '../services/adminService';
import type { DashboardStats, DashboardTrends } from '../types';

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className={`panel-stat-card p-5 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchDashboardTrends()])
      .then(([dashboard, dashboardTrends]) => {
        setStats(dashboard);
        setTrends(dashboardTrends);
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!stats || !trends) return null;

  const registrationsMap = new Map(
    trends.registrationsLast14Days.map((d) => [new Date(d.day).toDateString(), d.count])
  );
  const registrations = Array.from({ length: 14 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - idx));
    return {
      dayLabel: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      count: registrationsMap.get(date.toDateString()) ?? 0,
    };
  });
  const maxRegistration = Math.max(1, ...registrations.map((d) => d.count));
  const regPoints = registrations
    .map((d, i) => {
      const x = registrations.length <= 1 ? 10 : (i / (registrations.length - 1)) * 98;
      const y = 92 - (d.count / maxRegistration) * 82;
      return `${x},${y}`;
    })
    .join(' ');

  const revenueMap = new Map(trends.monthlyRevenueLast6Months.map((d) => [d.month, d.amount]));
  const revenue = Array.from({ length: 6 }).map((_, idx) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - idx));
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return {
      monthLabel: date.toLocaleDateString('en-IN', { month: 'short' }),
      amount: revenueMap.get(monthKey) ?? 0,
    };
  });
  const maxRevenue = Math.max(1, ...revenue.map((d) => d.amount));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-sm text-gray-500">Live stats from your Dai Massage platform.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          label="Pending Providers"
          value={stats.pendingProviders}
          icon="⏳"
          color="border-[#ffb84d]"
        />
        <StatCard
          label="Approved Providers"
          value={stats.approvedProviders}
          icon="✅"
          color="border-[#22c55e]"
        />
        <StatCard
          label="Total Customers"
          value={stats.totalCustomers}
          icon="👥"
          color="border-[#60a5fa]"
        />
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings}
          icon="📅"
          color="border-[#a78bfa]"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`}
          icon="💰"
          color="border-[#facc15]"
        />
        <StatCard
          label="New This Week"
          value={stats.totalCustomers}
          icon="📰"
          color="border-[#c4b5fd]"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel-surface p-4 h-64">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">User Registrations — Last 14 Days</h3>
          <div className="h-[210px] rounded-lg panel-chartbox p-2">
            {registrations.length === 0 ? (
              <p className="text-xs text-gray-400 p-3">No registration data available.</p>
            ) : (
              <div className="h-full">
                <svg viewBox="0 0 100 100" className="w-full h-[88%]">
                  <line x1="0" y1="92" x2="100" y2="92" stroke="#2b3648" strokeWidth="0.6" />
                  <polyline
                    fill="none"
                    stroke="#87f542"
                    strokeWidth="2"
                    points={regPoints}
                  />
                </svg>
                <div className="h-[12%] grid grid-cols-7 text-[10px] text-gray-400">
                  {registrations.filter((_, i) => i % 2 === 0).map((r) => (
                    <span key={r.dayLabel} className="text-center">
                      {r.dayLabel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="panel-surface p-4 h-64">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Monthly Revenue (₹) — Last 6 Months</h3>
          <div className="h-[210px] rounded-lg panel-chartbox p-2">
            {revenue.length === 0 ? (
              <p className="text-xs text-gray-400 p-3">No revenue data available.</p>
            ) : (
              <div className="h-full grid grid-cols-6 gap-2 items-end">
                {revenue.map((m) => (
                  <div key={m.monthLabel} className="flex flex-col items-center justify-end gap-1">
                    <div
                      className="w-8 rounded-t bg-[#87f542]"
                      style={{ height: `${Math.max(6, (m.amount / maxRevenue) * 140)}px` }}
                    />
                    <span className="text-[10px] text-gray-500">{m.monthLabel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
