/**
 * Redis client for caching. Optional - app works without REDIS_URL.
 */

import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;
  if (!config.redisUrl) return null;
  redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => (times < 3 ? 1000 : null),
    lazyConnect: true
  });
  redis.on('error', (err) => console.error('Redis error:', err));
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    const val = await client.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch {
    // ignore
  }
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    // ignore
  }
}

/** Cache key helpers - entity-based, not UI-specific */
export const cacheKeys = {
  symbolList: (marketId?: number, isActive?: boolean) =>
    `symbols:list:${marketId ?? 'all'}:${isActive ?? 'all'}`,
  reportTurnover: (dateFrom: string, dateTo: string, userId?: number) =>
    `report:turnover:${dateFrom}:${dateTo}:${userId ?? 'all'}`,
  reportBrokerage: (dateFrom: string, dateTo: string, userId?: number) =>
    `report:brokerage:${dateFrom}:${dateTo}:${userId ?? 'all'}`
};
