import mongoose from 'mongoose';
import { env } from './env';

/**
 * Next.js hot-reloads modules in dev, which would otherwise open a new
 * Mongo connection on every request. We cache the connection promise on
 * `global` so it survives across module reloads (standard Next.js +
 * Mongoose pattern). The worker process (a plain long-running Node
 * process) benefits from this too — it just connects once.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    cache.promise = mongoose.connect(env.MONGO_URI).then((m) => m);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
