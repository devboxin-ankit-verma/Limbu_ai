/**
 * Account settings page — payment gateway and payout preferences.
 */

import { useEffect, useState } from 'react';
import { fetchAccountSettings, updateAccountSettings } from '../services/adminService';

export default function AccountSettingsPage() {
  const [form, setForm] = useState({
    razorpayKeyId: '',
    razorpayKeySecret: '',
    upiId: '',
    codEnabled: false,
    registrationFee: 999,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountSettings()
      .then((res) => {
        setForm({
          razorpayKeyId: res.razorpayKeyId ?? '',
          razorpayKeySecret: res.razorpayKeySecret ?? '',
          upiId: res.upiId ?? '',
          codEnabled: !!res.codEnabled,
          registrationFee: res.registrationFee ?? 999,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateAccountSettings({
        razorpayKeyId: form.razorpayKeyId || null,
        razorpayKeySecret: form.razorpayKeySecret || null,
        upiId: form.upiId || null,
        codEnabled: form.codEnabled,
        registrationFee: Number(form.registrationFee) || 999,
      });
      setMessage('Settings saved successfully.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Account Settings</h2>
      <p className="text-sm text-gray-500 mb-6">Configure Razorpay, UPI and COD options.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Razorpay Key ID</span>
          <input
            value={form.razorpayKeyId}
            onChange={(e) => setForm((f) => ({ ...f, razorpayKeyId: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="rzp_live_xxxxx"
          />
        </label>

        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Razorpay Key Secret</span>
          <input
            value={form.razorpayKeySecret}
            onChange={(e) => setForm((f) => ({ ...f, razorpayKeySecret: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Paste secret here"
          />
        </label>

        <label className="text-sm">
          <span className="block text-gray-600 mb-1">UPI ID</span>
          <input
            value={form.upiId}
            onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="yourname@upi"
          />
        </label>

        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Registration Fee (₹)</span>
          <input
            type="number"
            min={0}
            value={form.registrationFee}
            onChange={(e) => setForm((f) => ({ ...f, registrationFee: Number(e.target.value) }))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="999"
          />
          <span className="text-xs text-gray-400 mt-1 block">
            One-time fee charged to massage providers on registration.
          </span>
        </label>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.codEnabled}
          onChange={(e) => setForm((f) => ({ ...f, codEnabled: e.target.checked }))}
        />
        Enable COD (Cash on Delivery)
      </label>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="mt-5 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
