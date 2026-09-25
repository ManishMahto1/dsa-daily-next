import { Worker, Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { QUEUE_NAMES } from '../queues/queue.names';
import { EmailJobData } from '../queues/email.queue';
import { Question } from '../models/question.model';
import { Delivery } from '../models/delivery.model';
import { sendDailyQuestionEmail } from '../modules/email/email.service';

export const emailWorker = new Worker<EmailJobData>(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailJobData>) => {
    const { deliveryId, questionId } = job.data;

    const [question, delivery] = await Promise.all([
      Question.findById(questionId),
      Delivery.findById(deliveryId),
    ]);

    if (!question || !delivery) {
      throw new Error(`Missing question or delivery for job ${job.id}`);
    }

    try {
      await sendDailyQuestionEmail(question, deliveryId);
      delivery.status = 'sent';
      delivery.sentAt = new Date();
      await delivery.save();
    } catch (err) {
      delivery.status = 'failed';
      delivery.errorMessage = err instanceof Error ? err.message : 'unknown error';
      await delivery.save();
      throw err; // BullMQ retries per defaultJobOptions
    }
  },
  { connection: redisConnection, concurrency: 1 }
);

emailWorker.on('completed', (job) => console.log(`[email] job ${job.id} sent`));
emailWorker.on('failed', (job, err) =>
  console.error(`[email] job ${job?.id} failed:`, err.message)
);
