/**
 * Providers management page — approve/reject registrations.
 */

import { useEffect, useState } from 'react';
import { fetchProviders, approveProvider, rejectProvider } from '../services/adminService';
import type { Provider } from '../types';

type StatusFilter = 'pending' | 'approved' | 'rejected';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ProvidersPage() {
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selected, setSelected] = useState<Provider | null>(null);
  const [query, setQuery] = useState('');

  const load = () => {
    setLoading(true);
    fetchProviders(status)
      .then(setProviders)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    await approveProvider(id).catch(console.error);
    setActionLoading(null);
    load();
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    await rejectProvider(id).catch(console.error);
    setActionLoading(null);
    load();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Providers</h2>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['pending', 'approved', 'rejected'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === s
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by provider name"
          className="border rounded-lg px-3 py-1.5 text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : providers.filter((p) =>
          (p.user?.name ?? '').toLowerCase().includes(query.toLowerCase())
        ).length === 0 ? (
        <div className="text-center text-gray-500 py-8">No {status} providers</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Phone</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Completed Services</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Wallet Amount</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Fee Paid</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers
                .filter((p) => (p.user?.name ?? '').toLowerCase().includes(query.toLowerCase()))
                .map((p) => (
                <tr key={p.id} className="border-b hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      className="text-orange-600 font-medium hover:underline"
                      onClick={() => setSelected(p)}
                    >
                      {p.user?.name ?? `Provider #${p.id}`}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.user?.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.completedServicesCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    ₹{Number(p.walletBalance ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {p.registrationFeePaidAt ? (
                      <span className="text-green-600">✓ Paid</span>
                    ) : (
                      <span className="text-gray-400">Not paid</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={actionLoading === p.id}
                          className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          disabled={actionLoading === p.id}
                          className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Provider detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{selected.user?.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Phone:</span> {selected.user?.phone}</div>
              <div><span className="text-gray-500">Email:</span> {selected.user?.email ?? '—'}</div>
              <div><span className="text-gray-500">Status:</span> <StatusBadge status={selected.status} /></div>
              <div><span className="text-gray-500">Wallet:</span> ₹{Number(selected.walletBalance).toFixed(2)}</div>
              {selected.bio && (
                <div>
                  <span className="text-gray-500">Bio:</span>
                  <p className="mt-1 text-gray-700">{selected.bio}</p>
                </div>
              )}
              {selected.expertise.length > 0 && (
                <div>
                  <span className="text-gray-500">Expertise:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.expertise.map((e) => (
                      <span key={e} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.services && selected.services.length > 0 && (
                <div>
                  <span className="text-gray-500">Services:</span>
                  <ul className="mt-1 space-y-1">
                    {selected.services.map((s) => (
                      <li key={s.id} className="flex justify-between">
                        <span>{s.name} ({s.durationMinutes} min)</span>
                        <span className="font-medium">₹{s.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {selected.status === 'pending' && (
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => { handleApprove(selected.id); setSelected(null); }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => { handleReject(selected.id); setSelected(null); }}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
