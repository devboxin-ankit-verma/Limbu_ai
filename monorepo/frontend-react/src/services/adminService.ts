/**
 * Admin API service — all admin-scoped API calls.
 */

import apiClient from './apiClient';
import type {
  DashboardStats,
  DashboardTrends,
  Provider,
  User,
  Booking,
  Payment,
  AccountSettings,
} from '../types';

export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await apiClient.get('/admin/dashboard');
  return res.data;
}

export async function fetchDashboardTrends(): Promise<DashboardTrends> {
  const res = await apiClient.get('/admin/dashboard/trends');
  return res.data;
}

export async function fetchProviders(
  status: 'pending' | 'approved' | 'rejected',
  offset = 0,
  limit = 20
): Promise<Provider[]> {
  const res = await apiClient.get('/admin/providers', { params: { status, offset, limit } });
  return res.data;
}

export async function approveProvider(id: number): Promise<Provider> {
  const res = await apiClient.patch(`/admin/providers/${id}/approve`);
  return res.data;
}

export async function rejectProvider(id: number): Promise<Provider> {
  const res = await apiClient.patch(`/admin/providers/${id}/reject`);
  return res.data;
}

export async function generateProviderCode(id: number): Promise<Provider> {
  const res = await apiClient.post(`/admin/providers/${id}/generate-code`);
  return res.data;
}

export async function fetchUsers(
  offset = 0,
  limit = 50,
  params?: { role?: string; query?: string; includeDeleted?: boolean }
): Promise<User[]> {
  const res = await apiClient.get('/admin/users', { params: { offset, limit, ...params } });
  return res.data;
}

export async function updateUser(
  id: number,
  data: Partial<Pick<User, 'name' | 'phone' | 'email' | 'role'>>
): Promise<User> {
  const res = await apiClient.patch(`/admin/users/${id}`, data);
  return res.data;
}

export async function softDeleteUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export async function restoreUser(id: number): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/restore`);
}

export async function fetchBookings(offset = 0, limit = 50): Promise<Booking[]> {
  const res = await apiClient.get('/admin/bookings', { params: { offset, limit } });
  return res.data;
}

export async function fetchPayments(offset = 0, limit = 50): Promise<Payment[]> {
  const res = await apiClient.get('/admin/payments', { params: { offset, limit } });
  return res.data;
}

export async function fetchRewardAudit(offset = 0, limit = 50): Promise<Payment[]> {
  const res = await apiClient.get('/admin/rewards/audit', { params: { offset, limit } });
  return res.data;
}

export async function fetchAccountSettings(): Promise<AccountSettings> {
  const res = await apiClient.get('/admin/settings/account');
  return res.data;
}

export async function updateAccountSettings(data: Partial<AccountSettings>): Promise<AccountSettings> {
  const res = await apiClient.put('/admin/settings/account', data);
  return res.data;
}
