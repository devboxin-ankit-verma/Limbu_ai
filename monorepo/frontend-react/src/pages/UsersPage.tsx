/**
 * Users management page — list all registered users.
 */

import { useEffect, useState } from 'react';
import { fetchUsers, updateUser, softDeleteUser, restoreUser } from '../services/adminService';
import type { User } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | 'provider' | 'customer' | 'admin'>('all');
  const [includeDeleted, setIncludeDeleted] = useState(false);
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

  useEffect(() => {
    load();
  }, [query, role, includeDeleted]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      provider: 'bg-purple-100 text-purple-700',
      customer: 'bg-blue-100 text-blue-700',
      admin: 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[role] ?? 'bg-gray-100'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Users ({users.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
          placeholder="Search name/phone/email"
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
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
          />
          Show soft deleted users
        </label>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{u.id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                <td className="px-4 py-3 text-gray-600">{u.email ?? '—'}</td>
                <td className="px-4 py-3">{roleBadge(u.role)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {!u.deletedAt ? (
                    <>
                      <button
                        onClick={() => setEditing(u)}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          await softDeleteUser(u.id);
                          load();
                        }}
                        className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={async () => {
                        await restoreUser(u.id);
                        load();
                      }}
                      className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-8 text-gray-400">No users found</p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md">
            <h3 className="font-bold mb-4">Edit User</h3>
            <div className="space-y-3">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                value={editing.email ?? ''}
                onChange={(e) => setEditing({ ...editing, email: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <select
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value as User['role'] })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="provider">Provider</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="px-3 py-2 border rounded-lg text-sm">
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
                className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
