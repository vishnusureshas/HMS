import Redis from 'ioredis';
import { env } from './env.js';
import logger from '../utils/logger.js';

let redisClient = null;

export function getRedis() {
  if (!redisClient) {
    redisClient = new Redis({
      host: env.redis.host,
      port: env.redis.port,
      password: env.redis.password || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error('Redis error:', err.message));
  }
  return redisClient;
}

export async function connectRedis() {
  try {
    const client = getRedis();
    await client.connect();
  } catch (err) {
    logger.warn('Redis connection failed — caching disabled:', err.message);
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
