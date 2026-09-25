import { Types } from 'mongoose';
import { getOrCreateProgress } from '../../models/progress.model';
import { computeNextLevel, applyAnswerResult } from '../dsa/difficulty.engine';
import { Delivery } from '../../models/delivery.model';

interface SubmitAnswerInput {
  deliveryId: string;
  isCorrect: boolean;
}

export async function submitAnswer({ deliveryId, isCorrect }: SubmitAnswerInput) {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new Error('Delivery not found');
  if (delivery.status === 'answered') throw new Error('This question has already been answered');

  const progress = await getOrCreateProgress();

  const { streak, missStreak } = applyAnswerResult(progress, isCorrect);
  progress.streak = streak;
  progress.missStreak = missStreak;
  progress.currentLevel = computeNextLevel({
    currentLevel: progress.currentLevel,
    streak,
    missStreak,
  });
  progress.totalAttempted += 1;
  if (isCorrect) progress.totalSolved += 1;

  if (!progress.solvedIds.some((id: Types.ObjectId) => id.equals(delivery.questionId))) {
    progress.solvedIds.push(delivery.questionId);
  }

  delivery.status = 'answered';
  delivery.answeredAt = new Date();
  delivery.isCorrect = isCorrect;

  await Promise.all([progress.save(), delivery.save()]);

  return { progress, delivery };
}

export async function getProgressSummary() {
  const progress = await getOrCreateProgress();
  return {
    currentLevel: progress.currentLevel,
    streak: progress.streak,
    missStreak: progress.missStreak,
    totalSolved: progress.totalSolved,
    totalAttempted: progress.totalAttempted,
    accuracy:
      progress.totalAttempted === 0
        ? 0
        : Math.round((progress.totalSolved / progress.totalAttempted) * 100),
  };
}
