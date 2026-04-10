/**
 * Bookings management page.
 */

import { useEffect, useState } from 'react';
import { fetchBookings } from '../services/adminService';
import type { Booking } from '../types';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | Booking['status']>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const filtered = bookings.filter((b) => {
    const matchesStatus = status === 'all' || b.status === status;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      (b.customer?.name ?? '').toLowerCase().includes(q) ||
      (b.provider?.user?.name ?? '').toLowerCase().includes(q) ||
      (b.service?.name ?? '').toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Bookings ({filtered.length})</h2>
      <div className="flex gap-2 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
          placeholder="Search customer/provider/service"
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-gray-600 font-medium">#</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Provider</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Service</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Scheduled</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{b.id}</td>
                <td className="px-4 py-3 text-gray-800">{b.customer?.name ?? b.customerId}</td>
                <td className="px-4 py-3 text-gray-800">
                  {b.provider?.user?.name ?? `Provider #${b.providerId}`}
                </td>
                <td className="px-4 py-3 text-gray-600">{b.service?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(b.scheduledAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 font-medium">₹{Number(b.amount).toFixed(2)}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-400">No bookings found</p>
        )}
      </div>
    </div>
  );
}
