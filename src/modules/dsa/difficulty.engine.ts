import { Difficulty } from '../../models/question.model';

const LEVEL_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

const PROMOTE_AFTER_STREAK = 3; // 3 correct in a row -> level up
const DEMOTE_AFTER_MISSES = 2; // 2 wrong/unanswered in a row -> level down

interface ProgressLike {
  currentLevel: Difficulty;
  streak: number;
  missStreak: number;
}

export function computeNextLevel(progress: ProgressLike): Difficulty {
  const idx = LEVEL_ORDER.indexOf(progress.currentLevel);

  if (progress.streak >= PROMOTE_AFTER_STREAK && idx < LEVEL_ORDER.length - 1) {
    return LEVEL_ORDER[idx + 1];
  }
  if (progress.missStreak >= DEMOTE_AFTER_MISSES && idx > 0) {
    return LEVEL_ORDER[idx - 1];
  }
  return progress.currentLevel;
}

export function applyAnswerResult(
  progress: ProgressLike,
  isCorrect: boolean
): { streak: number; missStreak: number } {
  if (isCorrect) return { streak: progress.streak + 1, missStreak: 0 };
  return { streak: 0, missStreak: progress.missStreak + 1 };
}
