/**
 * Authentication service - API calls only.
 * 
 * This module contains ONLY API calls.
 * NO UI logic, NO routing, NO state management.
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

/**
 * Authentication service - handles all API calls for authentication.
 * 
 * This service contains ONLY API operations.
 * It does NOT contain UI logic.
 * It does NOT contain routing logic.
 */
export const authService = {
  /**
   * Login user.
   * 
   * @param credentials - Login credentials
   * @returns Promise resolving to auth token
   */
  async login(credentials: LoginCredentials): Promise<string> {
    const response = await apiClient.post<{ token: string }>(API_ENDPOINTS.LOGIN, credentials);
    return response.data.token;
  },
  
  /**
   * Register new user.
   * 
   * @param data - Registration data
   * @returns Promise resolving to auth token
   */
  async register(data: RegisterData): Promise<string> {
    const response = await apiClient.post<{ token: string }>(API_ENDPOINTS.REGISTER, data);
    return response.data.token;
  },
  
  /**
   * Get current authenticated user.
   * 
   * @returns Promise resolving to current user
   */
  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.CURRENT_USER);
    return response.data;
  },
  
  /**
   * Logout user.
   * 
   * @returns Promise resolving when logout is complete
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.LOGOUT);
  }
};
