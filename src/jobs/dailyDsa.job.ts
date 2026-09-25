import { pickNextQuestionForToday } from '../modules/dsa/dsa.service';
import { Delivery } from '../models/delivery.model';
import { getOrCreateProgress } from '../models/progress.model';
import { emailQueue } from '../queues/email.queue';
import { sendDailyQuestionEmail } from '../modules/email/email.service';

export interface RunDailyJobOptions {
  sendImmediately?: boolean;
}

/**
 * Runs the daily DSA cycle:
 * 1. Picks/generates the next question via Gemini, based on current level.
 * 2. Creates a Delivery record.
 * 3. Sends the email directly via Resend (essential for Vercel Cron and instant testing),
 *    or queues via BullMQ for persistent background workers.
 */
export async function runDailyDsaJob(
  options: RunDailyJobOptions = { sendImmediately: true }
): Promise<{ deliveryId: string; title: string }> {
  const progress = await getOrCreateProgress();

  const question = await pickNextQuestionForToday();

  const delivery = await Delivery.create({
    questionId: question._id,
    difficultyAtSend: progress.currentLevel,
    status: 'pending',
  });

  if (options.sendImmediately) {
    try {
      await sendDailyQuestionEmail(question, delivery._id.toString());
      delivery.status = 'sent';
      delivery.sentAt = new Date();
      await delivery.save();
    } catch (err: unknown) {
      delivery.status = 'failed';
      delivery.errorMessage = err instanceof Error ? err.message : 'Unknown email error';
      await delivery.save();
      console.warn('[DailyDSA] Direct email send failed:', err);
    }
  } else {
    try {
      await emailQueue.add('send-question-email', {
        deliveryId: delivery._id.toString(),
        questionId: question._id.toString(),
      });
    } catch (err) {
      console.warn('[DailyDSA] Could not enqueue to BullMQ, falling back to direct email send:', err);
      try {
        await sendDailyQuestionEmail(question, delivery._id.toString());
        delivery.status = 'sent';
        delivery.sentAt = new Date();
        await delivery.save();
      } catch (sendErr) {
        delivery.status = 'failed';
        delivery.errorMessage = sendErr instanceof Error ? sendErr.message : 'Unknown email error';
        await delivery.save();
      }
    }
  }

  return { deliveryId: delivery._id.toString(), title: question.title };
}
