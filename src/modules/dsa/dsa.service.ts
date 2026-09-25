import { Types } from 'mongoose';
import { getOrCreateProgress } from '../../models/progress.model';
import { Delivery } from '../../models/delivery.model';
import { findOrGenerateQuestion } from './question.repository';
import { IQuestion } from '../../models/question.model';

/**
 * Picks (or generates via Gemini) the next question, based on the current level.
 * Guarantees that questions are 100% distinct: excludes any question that has
 * already been delivered in the past OR marked as solved.
 */
export async function pickNextQuestionForToday(): Promise<IQuestion> {
  const [progress, deliveredQuestionIds] = await Promise.all([
    getOrCreateProgress(),
    Delivery.find().distinct('questionId'),
  ]);

  // Combine solvedIds and all previously delivered question IDs
  const excludeIdSet = new Set<string>();
  for (const id of progress.solvedIds) {
    if (id) excludeIdSet.add(id.toString());
  }
  for (const id of deliveredQuestionIds) {
    if (id) excludeIdSet.add(id.toString());
  }

  const excludeIds = Array.from(excludeIdSet).map((id) => new Types.ObjectId(id));

  return findOrGenerateQuestion(progress.currentLevel, excludeIds);
}
