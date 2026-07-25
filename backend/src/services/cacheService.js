import { getRedis } from '../config/redis.js';
import logger from '../utils/logger.js';

const DEFAULT_TTL = 300;

export async function cacheGet(key) {
  try {
    const redis = getRedis();
    if (!redis?.status === 'ready') return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.warn(`Cache GET failed for ${key}:`, err.message);
    return null;
  }
}

export async function cacheSet(key, value, ttl = DEFAULT_TTL) {
  try {
    const redis = getRedis();
    if (!redis?.status === 'ready') return;
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    logger.warn(`Cache SET failed for ${key}:`, err.message);
  }
}

export async function cacheDel(key) {
  try {
    const redis = getRedis();
    if (!redis?.status === 'ready') return;
    await redis.del(key);
  } catch (err) {
    logger.warn(`Cache DEL failed for ${key}:`, err.message);
  }
}

export async function cacheDelPattern(pattern) {
  try {
    const redis = getRedis();
    if (!redis?.status === 'ready') return;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn(`Cache DEL pattern failed for ${pattern}:`, err.message);
  }
}
