import { pickNextQuestionForToday } from '../modules/dsa/dsa.service';
import { Delivery } from '../models/delivery.model';
import { getOrCreateProgress } from '../models/progress.model';
import { emailQueue } from '../queues/email.queue';

/**
 * Runs every day at 8PM (triggered by the scheduler queue's repeatable job).
 * 1. Picks/generates the next question via Gemini, based on current level.
 * 2. Creates a "pending" Delivery record.
 * 3. Enqueues the actual email send onto a separate queue, so a Resend
 *    hiccup gets retried independently of question generation/selection.
 */
export async function runDailyDsaJob(): Promise<{ deliveryId: string; title: string }> {
  const progress = await getOrCreateProgress();

  const question = await pickNextQuestionForToday();

  const delivery = await Delivery.create({
    questionId: question._id,
    difficultyAtSend: progress.currentLevel,
    status: 'pending',
  });

  await emailQueue.add('send-question-email', {
    deliveryId: delivery._id.toString(),
    questionId: question._id.toString(),
  });

  return { deliveryId: delivery._id.toString(), title: question.title };
}
