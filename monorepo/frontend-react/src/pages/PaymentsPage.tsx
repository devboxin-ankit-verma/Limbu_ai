/**
 * Payments log page.
 */

import { useEffect, useState } from 'react';
import { fetchPayments } from '../services/adminService';
import type { Payment } from '../types';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | Payment['status']>('all');
  const [type, setType] = useState<'all' | Payment['type']>('all');

  useEffect(() => {
    fetchPayments()
      .then(setPayments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const filtered = payments.filter((p) => {
    const okStatus = status === 'all' || p.status === status;
    const okType = type === 'all' || p.type === type;
    return okStatus && okType;
  });

  const totalPaid = filtered
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Payments</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
          <span className="text-green-700 font-semibold">
            Total Revenue: ₹{totalPaid.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Type</option>
          <option value="registration">Registration</option>
          <option value="service">Service</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-gray-600 font-medium">#</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Type</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Razorpay Order</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{p.id}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.type === 'registration'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">₹{Number(p.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate max-w-[140px]">
                  {p.razorpayOrderId ?? '—'}
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-400">No payments found</p>
        )}
      </div>
    </div>
  );
}
