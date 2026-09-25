import { getOrCreateProgress } from '../../models/progress.model';
import { findOrGenerateQuestion } from './question.repository';
import { IQuestion } from '../../models/question.model';

/**
 * Picks (or generates via Gemini) the next question, based on the
 * single stored Progress document. No userId needed — single-user system.
 */
export async function pickNextQuestionForToday(): Promise<IQuestion> {
  const progress = await getOrCreateProgress();
  return findOrGenerateQuestion(progress.currentLevel, progress.solvedIds);
}
