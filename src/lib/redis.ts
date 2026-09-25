import IORedis, { Redis } from 'ioredis';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __redisConnection: Redis | undefined;
}

// Reused across hot reloads in dev, and across the worker's single boot.
export const redisConnection: Redis =
  global.__redisConnection ??
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
  });

global.__redisConnection = redisConnection;
