import { apiClient } from './apiClient';
import type { ApiResponse, PaginatedResponse } from '../types/api';

const BASE = '/api/v1/notices';

export interface NoticeRow {
  id: number;
  title: string;
  body: string;
  type: string;
  target: string;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export const noticeService = {
  async list(params: { page?: number; limit?: number; target?: string; isActive?: boolean }) {
    const res = await apiClient.get<PaginatedResponse<NoticeRow>>(BASE, { params });
    if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid response');
    return { data: res.data.data, meta: res.data.meta! };
  },
  async create(body: { title: string; body: string; type?: string; target?: string }) {
    const res = await apiClient.post<ApiResponse<NoticeRow>>(BASE, body);
    if (!res.data.success || !res.data.data) throw new Error('Create failed');
    return res.data.data;
  },
};
