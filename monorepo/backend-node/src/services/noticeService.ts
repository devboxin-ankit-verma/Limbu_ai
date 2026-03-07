/**
 * Notice service - business logic for notices (broadcast messages).
 */

import { NoticeRepository } from '../repositories/noticeRepository';

export class NoticeService {
  constructor(private readonly noticeRepo: NoticeRepository) {}

  async list(options: Parameters<NoticeRepository['findMany']>[0]) {
    return this.noticeRepo.findMany(options);
  }

  async create(data: { title: string; body: string; type?: string; target?: string }) {
    return this.noticeRepo.create(data);
  }
}
