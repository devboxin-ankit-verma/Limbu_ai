import { apiClient } from './apiClient';
import type { ApiResponse, PaginatedResponse } from '../types/api';

const BASE = '/api/v1/notifications';

export interface NotificationRow {
  id: number;
  userId: number;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  async list(params: { page?: number; limit?: number; read?: boolean }) {
    const res = await apiClient.get<PaginatedResponse<NotificationRow>>(BASE, { params });
    if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid response');
    return { data: res.data.data, meta: res.data.meta! };
  },
  async markRead(id: number) {
    await apiClient.patch(`${BASE}/${id}/read`, {});
  },
};
