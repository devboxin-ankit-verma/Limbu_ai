/**
 * Payments log page — with user info and detail modal.
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
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
      type === 'registration' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function PaymentDetailModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const isManual = payment.razorpayPaymentId?.startsWith('manual_');
  const manualMethod = isManual ? payment.razorpayPaymentId?.replace('manual_', '').split('_')[0] : null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Payment #{payment.id}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(payment.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Amount highlight */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
          <p className="text-3xl font-bold text-gray-800">₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <TypeBadge type={payment.type} />
            <StatusBadge status={payment.status} />
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {payment.user && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">User</span>
              <span className="font-medium text-gray-800">{payment.user.name}</span>
            </div>
          )}
          {payment.user && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Phone</span>
              <span className="text-gray-700">{payment.user.phone}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Payment Method</span>
            <span className="text-gray-700 capitalize">
              {isManual ? (manualMethod === 'cod' ? 'Cash on Delivery' : 'UPI (Manual)') : 'Razorpay'}
            </span>
          </div>
          {payment.razorpayOrderId && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Razorpay Order</span>
              <span className="font-mono text-xs text-gray-600 break-all text-right">{payment.razorpayOrderId}</span>
            </div>
          )}
          {payment.razorpayPaymentId && !isManual && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Payment ID</span>
              <span className="font-mono text-xs text-gray-600 break-all text-right">{payment.razorpayPaymentId}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-500">User ID</span>
            <span className="text-gray-700">#{payment.userId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | Payment['status']>('all');
  const [type, setType] = useState<'all' | Payment['type']>('all');
  const [selected, setSelected] = useState<Payment | null>(null);

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

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const registrationPaid = paidPayments.filter((p) => p.type === 'registration');
  const servicePaid = paidPayments.filter((p) => p.type === 'service');

  const totalRegistrationCount = registrationPaid.length;
  const totalServiceCount = servicePaid.length;
  const totalRegistrationAmount = registrationPaid.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalServiceAmount = servicePaid.reduce((sum, p) => sum + Number(p.amount), 0);

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Payments</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <p className="text-purple-500 text-xs font-medium mb-1">Total Registration</p>
          <p className="text-purple-700 font-bold text-lg">{totalRegistrationCount}</p>
          <p className="text-purple-600 text-xs mt-0.5">₹{fmt(totalRegistrationAmount)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-blue-500 text-xs font-medium mb-1">Total Service</p>
          <p className="text-blue-700 font-bold text-lg">{totalServiceCount}</p>
          <p className="text-blue-600 text-xs mt-0.5">₹{fmt(totalServiceAmount)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 col-span-2 md:col-span-1">
          <p className="text-green-500 text-xs font-medium mb-1">Total Revenue</p>
          <p className="text-green-700 font-bold text-lg">₹{fmt(totalPaid)}</p>
          <p className="text-green-600 text-xs mt-0.5">{paidPayments.length} paid payments</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-gray-600 font-medium">#</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">User</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Type</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Method</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Date</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isManual = p.razorpayPaymentId?.startsWith('manual_');
              const method = isManual
                ? p.razorpayPaymentId?.replace('manual_', '').split('_')[0] === 'cod'
                  ? 'COD'
                  : 'UPI'
                : p.razorpayOrderId
                ? 'Razorpay'
                : '—';

              return (
                <tr key={p.id} className="border-b hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{p.user?.name ?? `User #${p.userId}`}</div>
                    <div className="text-xs text-gray-400">{p.user?.phone}</div>
                  </td>
                  <td className="px-4 py-3"><TypeBadge type={p.type} /></td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{method}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(p)}
                      className="text-xs text-orange-600 hover:underline font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-400">No payments found</p>
        )}
      </div>

      {selected && <PaymentDetailModal payment={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
