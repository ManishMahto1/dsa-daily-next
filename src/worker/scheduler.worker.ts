import { Worker } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { QUEUE_NAMES } from '../queues/queue.names';
import { runDailyDsaJob } from '../jobs/dailyDsa.job';

export const schedulerWorker = new Worker(
  QUEUE_NAMES.SCHEDULER,
  async () => {
    const result = await runDailyDsaJob();
    console.log(`[scheduler] Sent "${result.title}" — delivery ${result.deliveryId}`);
  },
  { connection: redisConnection, concurrency: 1 }
);

schedulerWorker.on('failed', (job, err) =>
  console.error(`[scheduler] job ${job?.id} failed:`, err.message)
);
