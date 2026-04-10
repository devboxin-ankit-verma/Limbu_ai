/**
 * Admin auth service — login with email + password.
 */

import apiClient from './apiClient';

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await apiClient.post('/auth/login', {
    identifier: email, // backend accepts email or phone via 'identifier'
    password,
  });
  const { accessToken, role } = res.data;
  if (role !== 'admin') throw new Error('Access denied: admin credentials only');
  localStorage.setItem('admin_token', accessToken);
  return accessToken;
}

export function adminLogout(): void {
  localStorage.removeItem('admin_token');
}

export function getAdminToken(): string | null {
  return localStorage.getItem('admin_token');
}
