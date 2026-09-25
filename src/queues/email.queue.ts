import { Queue } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { QUEUE_NAMES } from './queue.names';

export interface EmailJobData {
  deliveryId: string;
  questionId: string;
}

export const emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.EMAIL, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: false,
  },
});
