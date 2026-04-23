/**
 * Users management page — list, view details, edit, soft-delete, restore.
 */

import React, { useEffect, useState } from 'react';
import { fetchUsers, updateUser, softDeleteUser, restoreUser } from '../services/adminService';
import type { User } from '../types';

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    provider: 'bg-purple-100 text-purple-700',
    customer: 'bg-blue-100 text-blue-700',
    admin: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[role] ?? 'bg-gray-100'}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function DocImage({ url, label }: { url: string; label: string }) {
  const isPdf = url.toLowerCase().endsWith('.pdf');
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-blue-600 hover:underline bg-blue-50 rounded-lg px-3 py-2 border border-blue-100"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          View PDF
        </a>
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          <img
            src={url}
            alt={label}
            className="w-full h-40 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity"
          />
        </a>
      )}
    </div>
  );
}

function UserDetailModal({ user, onClose, onEdit, onDelete, onRestore }: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const isDeleted = !!user.deletedAt;
  const p = user.provider;

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={user.role} />
                {isDeleted && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Deleted</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-2">×</button>
        </div>

        {/* Basic Details */}
        <div className="divide-y divide-gray-100 text-sm mb-5">
          <InfoRow label="User ID" value={`#${user.id}`} />
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="Email" value={user.email ?? '—'} />
          <InfoRow label="Age" value={user.age ? `${user.age} yrs` : '—'} />
          <InfoRow label="Gender" value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '—'} />
          <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
          {isDeleted && (
            <InfoRow label="Deleted On" value={new Date(user.deletedAt!).toLocaleDateString('en-IN')} highlight="red" />
          )}
        </div>

        {/* Provider Section */}
        {p && (
          <>
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-5 h-0.5 bg-orange-400 inline-block rounded"></span>
                Provider Details
              </h4>
              <div className="divide-y divide-gray-100 text-sm mb-3">
                <InfoRow label="Provider ID" value={`#${p.id}`} />
                <InfoRow
                  label="Status"
                  value=""
                  badge={
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[p.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  }
                />
                <InfoRow label="Wallet Balance" value={`₹${Number(p.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                <InfoRow label="Provider Code" value={p.providerCode ?? '—'} />
                <InfoRow label="Referred Users" value={String(p.referredUsersCount ?? 0)} />
                <InfoRow label="Identity Hidden" value={p.identityHidden ? 'Yes (profile blurred)' : 'No'} />
                {p.registrationFeePaidAt && (
                  <InfoRow label="Reg. Fee Paid" value={new Date(p.registrationFeePaidAt).toLocaleDateString('en-IN')} />
                )}
              </div>

              {/* Expertise */}
              {p.expertise && p.expertise.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1.5">Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.expertise.map((e) => (
                      <span key={e} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {p.bio && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{p.bio}</p>
                </div>
              )}
            </div>

            {/* Verification Documents */}
            {(p.aadhaarUrl || p.passportPhotoUrl) && (
              <div className="mb-5">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-5 h-0.5 bg-orange-400 inline-block rounded"></span>
                  Verification Documents
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {p.aadhaarUrl && <DocImage url={p.aadhaarUrl} label="Aadhaar Card" />}
                  {p.passportPhotoUrl && <DocImage url={p.passportPhotoUrl} label="Passport Photo" />}
                </div>
              </div>
            )}

            {/* Profile Photos */}
            {p.photos && p.photos.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-5 h-0.5 bg-orange-400 inline-block rounded"></span>
                  Profile Photos
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {p.photos.map((ph, i) => (
                    <a key={i} href={ph} target="_blank" rel="noreferrer">
                      <img
                        src={ph}
                        alt={`Photo ${i + 1}`}
                        className={`w-full h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity ${p.identityHidden ? 'blur-sm' : ''}`}
                      />
                    </a>
                  ))}
                </div>
                {p.identityHidden && (
                  <p className="text-xs text-gray-400 mt-1.5">Profile photos are blurred (provider chose to hide identity).</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          {!isDeleted ? (
            <>
              <button
                onClick={onEdit}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={onRestore}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Restore Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight, badge }: {
  label: string;
  value: string;
  highlight?: 'red';
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-gray-500">{label}</span>
      {badge ?? (
        <span className={`font-medium text-right ${highlight === 'red' ? 'text-red-600' : 'text-gray-800'}`}>{value}</span>
      )}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | 'provider' | 'customer' | 'admin'>('all');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [viewing, setViewing] = useState<User | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchUsers(0, 50, {
      query: query || undefined,
      role: role === 'all' ? undefined : role,
      includeDeleted,
    })
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [query, role, includeDeleted]);

  const handleDelete = async (u: User) => {
    await softDeleteUser(u.id);
    setViewing(null);
    load();
  };

  const handleRestore = async (u: User) => {
    await restoreUser(u.id);
    setViewing(null);
    load();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-5">Users ({users.length})</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
          placeholder="Search name / phone / email"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Roles</option>
          <option value="provider">Provider</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700 col-span-2">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
          />
          Show soft-deleted users
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-gray-600 font-medium">#</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Phone</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Email</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Role</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Joined</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className={`border-b hover:bg-orange-50 transition-colors ${u.deletedAt ? 'opacity-50' : ''}`}
              >
                <td className="px-4 py-3 text-gray-400">{u.id}</td>
                <td className="px-4 py-3">
                  <button
                    className="font-medium text-orange-600 hover:underline text-left"
                    onClick={() => setViewing(u)}
                  >
                    {u.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                <td className="px-4 py-3 text-gray-600">{u.email ?? '—'}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewing(u)}
                      className="text-xs bg-gray-50 text-gray-700 border px-2 py-1 rounded hover:bg-gray-100"
                    >
                      View
                    </button>
                    {!u.deletedAt ? (
                      <>
                        <button
                          onClick={() => setEditing(u)}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(u)}
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-8 text-gray-400">No users found</p>
        )}
      </div>

      {/* View Details Modal */}
      {viewing && (
        <UserDetailModal
          user={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
          onDelete={() => handleDelete(viewing)}
          onRestore={() => handleRestore(viewing)}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl">
            <h3 className="font-bold mb-4 text-gray-800">Edit User</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Phone"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  value={editing.email ?? ''}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value || null })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Role</label>
                <select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as User['role'] })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="provider">Provider</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await updateUser(editing.id, {
                    name: editing.name,
                    phone: editing.phone,
                    email: editing.email,
                    role: editing.role,
                  });
                  setSaving(false);
                  setEditing(null);
                  load();
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
