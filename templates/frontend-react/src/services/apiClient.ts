/**
 * API client - HTTP client configuration.
 * 
 * This module provides a configured HTTP client for API calls.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config';

/**
 * Create configured axios instance.
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Handle unauthorized
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  return client;
};

export const apiClient = createApiClient();
