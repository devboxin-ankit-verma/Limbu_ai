/**
 * Notification service - per-user notifications.
 */

import { NotificationRepository } from '../repositories/notificationRepository';
import { NotFoundError } from '../utils/errors';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async listByUserId(userId: number, options: { skip: number; limit: number; read?: boolean }) {
    return this.notificationRepo.findManyByUserId(userId, options);
  }

  async markRead(id: number, userId: number): Promise<void> {
    const ok = await this.notificationRepo.markRead(id, userId);
    if (!ok) throw new NotFoundError('Notification not found');
  }
}
