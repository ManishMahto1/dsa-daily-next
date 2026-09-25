import { Queue } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { QUEUE_NAMES } from './queue.names';
import { env } from '../lib/env';

export const schedulerQueue = new Queue(QUEUE_NAMES.SCHEDULER, {
  connection: redisConnection,
});

/**
 * Registers the repeatable 8PM job. Fixed jobId makes this idempotent —
 * safe to call on every worker boot without creating duplicate schedules.
 */
export async function registerDailySchedule(): Promise<void> {
  await schedulerQueue.add(
    'run-daily-dsa',
    {},
    {
      repeat: { pattern: env.DAILY_CRON, tz: env.TIMEZONE },
      jobId: 'daily-dsa-8pm',
      removeOnComplete: 50,
      removeOnFail: 50,
    }
  );
}
