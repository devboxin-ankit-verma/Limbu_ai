/**
 * Providers management page — approve/reject registrations.
 */

import { useEffect, useState } from 'react';
import { fetchProviders, approveProvider, rejectProvider, generateProviderCode } from '../services/adminService';
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

  const handleGenerateCode = async (id: number) => {
    setActionLoading(id);
    await generateProviderCode(id).catch(console.error);
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
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Provider Code</th>
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
                  <td className="px-4 py-3 text-gray-700 font-mono">
                    {p.providerCode ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateCode(p.id)}
                        disabled={actionLoading === p.id}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        Code
                      </button>
                    {p.status === 'pending' && (
                      <>
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
                      </>
                    )}
                    </div>
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
            {/* Provider header with avatar / first photo */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {selected.photos && selected.photos.length > 0 ? (
                  <img
                    src={selected.photos[0]}
                    alt="Profile"
                    className={`w-16 h-16 rounded-full object-cover border-2 border-orange-200 ${selected.identityHidden ? 'blur-sm' : ''}`}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600 shrink-0">
                    {selected.user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selected.user?.name}</h3>
                  <p className="text-xs text-gray-500">{selected.user?.phone}</p>
                  {selected.identityHidden && (
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Identity hidden from customers</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {/* All profile photos grid */}
            {selected.photos && selected.photos.length > 1 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Profile Photos</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {selected.photos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className={`w-full aspect-square object-cover rounded-lg ${selected.identityHidden ? 'blur-sm' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Verification documents — always fully visible, never blurred */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                  <span>📄</span> Aadhaar Card
                  <span className="text-green-600 font-semibold">(Always Visible)</span>
                </p>
                {selected.aadhaarUrl ? (
                  <a href={selected.aadhaarUrl} target="_blank" rel="noreferrer">
                    <img
                      src={selected.aadhaarUrl}
                      alt="Aadhaar"
                      className="w-full h-28 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="w-full h-28 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                    Not uploaded
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                  <span>🪪</span> Passport Photo
                  {selected.identityHidden && (
                    <span className="text-orange-500 font-semibold">(Hidden from customers)</span>
                  )}
                </p>
                {selected.passportPhotoUrl ? (
                  <div className="relative">
                    {/* Admin always sees the real photo; blur is only on customer-facing UI */}
                    <img
                      src={selected.passportPhotoUrl}
                      alt="Passport Photo"
                      className="w-full h-28 object-cover rounded-lg border border-gray-200"
                    />
                    {selected.identityHidden && (
                      <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-orange-500/10 border border-orange-300">
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                          Blurred for customers
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-28 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                    Not uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Phone:</span> {selected.user?.phone}</div>
              <div><span className="text-gray-500">Email:</span> {selected.user?.email ?? '—'}</div>
              <div><span className="text-gray-500">Status:</span> <StatusBadge status={selected.status} /></div>
              <div><span className="text-gray-500">Wallet:</span> ₹{Number(selected.walletBalance).toFixed(2)}</div>
              <div><span className="text-gray-500">Provider Code:</span> {selected.providerCode ?? '—'}</div>
              <div><span className="text-gray-500">Referral Count:</span> {selected.referredUsersCount ?? 0}</div>
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
