/**
 * Axios API client with auth token injection.
 */

import axios from 'axios';
import { config } from '../config';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((req) => {
  const token = localStorage.getItem('admin_token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;
