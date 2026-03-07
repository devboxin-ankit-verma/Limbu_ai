/**
 * User service - API calls only.
 * 
 * This module contains ONLY API calls.
 * NO UI logic, NO routing, NO state management.
 */

import { apiClient } from './apiClient';
import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import type { ApiResponse, PaginatedResponse } from '../types/api';

/**
 * User service - API calls for users (traders).
 * Backend returns { success, data } or { success, data, meta }.
 */
export const userService = {
  async getUsers(params?: { page?: number; limit?: number; q?: string; sort?: string; order?: string }): Promise<{ data: User[]; meta?: { page: number; limit: number; total: number } }> {
    const response = await apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS, { params });
    const body = response.data;
    if (!body.success || !Array.isArray(body.data)) {
      throw new Error('Invalid response');
    }
    return { data: body.data, meta: body.meta };
  },

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`${API_ENDPOINTS.USERS}/${userId}`);
    const body = response.data;
    if (!body.success || !body.data) {
      throw new Error('User not found');
    }
    return body.data;
  },
  
  /**
   * Create a new user.
   * 
   * @param userData - User data to create
   * @returns Promise resolving to created user
   */
  async createUser(userData: Partial<User> & { email: string; username: string; password: string }): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.USERS, userData);
    const body = response.data;
    if (!body.success || !body.data) throw new Error('Create failed');
    return body.data;
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`${API_ENDPOINTS.USERS}/${userId}`, userData);
    const body = response.data;
    if (!body.success || !body.data) throw new Error('Update failed');
    return body.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.USERS}/${userId}`);
  },
};
