/**
 * User service - API calls only.
 * 
 * This module contains ONLY API calls.
 * NO UI logic, NO routing, NO state management.
 */

import { apiClient } from './apiClient';
import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';

/**
 * User service - handles all API calls for users.
 * 
 * This service contains ONLY API operations.
 * It does NOT contain UI logic.
 * It does NOT contain routing logic.
 */
export const userService = {
  /**
   * Get all users.
   * 
   * @returns Promise resolving to array of users
   */
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>(API_ENDPOINTS.USERS);
    return response.data;
  },
  
  /**
   * Get user by ID.
   * 
   * @param userId - User ID to retrieve
   * @returns Promise resolving to user
   */
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`${API_ENDPOINTS.USERS}/${userId}`);
    return response.data;
  },
  
  /**
   * Create a new user.
   * 
   * @param userData - User data to create
   * @returns Promise resolving to created user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.post<User>(API_ENDPOINTS.USERS, userData);
    return response.data;
  },
  
  /**
   * Update user.
   * 
   * @param userId - User ID to update
   * @param userData - Updated user data
   * @returns Promise resolving to updated user
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`${API_ENDPOINTS.USERS}/${userId}`, userData);
    return response.data;
  },
  
  /**
   * Delete user.
   * 
   * @param userId - User ID to delete
   * @returns Promise resolving when user is deleted
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.USERS}/${userId}`);
  }
};
