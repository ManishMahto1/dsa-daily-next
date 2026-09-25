import { Difficulty } from '../../models/question.model';

export const LEVEL_ORDER: Difficulty[] = ['school', 'college', 'easy', 'medium', 'hard'];

export const PROMOTE_AFTER_STREAK = 3; // 3 correct in a row -> level up
export const DEMOTE_AFTER_MISSES = 3; // 3 misses -> level down

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
