/**
 * Auth service - API calls for admin login.
 * Response shape: { success, data: { token, adminUser } }.
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { ApiResponse } from '../types/api';
import type { AdminUser } from '../stores/authStore';

interface AdminLoginPayload {
  email: string;
  password: string;
}

interface AdminLoginResult {
  token: string;
  adminUser: AdminUser;
}

export const authService = {
  async adminLogin(payload: AdminLoginPayload): Promise<AdminLoginResult> {
    const response = await apiClient.post<ApiResponse<AdminLoginResult>>(
      API_ENDPOINTS.AUTH_ADMIN_LOGIN,
      payload
    );
    const body = response.data;
    if (!body.success || !body.data) {
      throw new Error((body as { error?: string }).error ?? 'Login failed');
    }
    return body.data;
  },
};
