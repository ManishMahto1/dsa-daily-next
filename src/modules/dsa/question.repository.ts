import { Types } from 'mongoose';
import { Question, Difficulty, IQuestion } from '../../models/question.model';
import { generateQuestion } from '../gemini/gemini.service';

/**
 * Question sourcing strategy:
 *  1. Look for an existing, unseen question at this difficulty in Mongo
 *     (questions Gemini generated on previous days, not yet sent).
 *  2. If the pool is empty, ask Gemini for a brand-new one, save it,
 *     and return it. This means the "question bank" grows itself —
 *     no manual seeding required.
 */
export async function findOrGenerateQuestion(
  difficulty: Difficulty,
  excludeIds: Types.ObjectId[]
): Promise<IQuestion> {
  const existing = await findUnseenExisting(difficulty, excludeIds);
  if (existing) return existing;

  const recentTitles = await Question.find({ difficulty })
    .sort({ createdAt: -1 })
    .limit(30)
    .select('title')
    .lean();

  const generated = await generateQuestion(
    difficulty,
    recentTitles.map((q) => q.title)
  );

  return Question.create({
    title: generated.title,
    topic: generated.topic,
    statement: generated.statement,
    hints: generated.hints,
    difficulty,
    source: 'gemini',
  });
}

async function findUnseenExisting(
  difficulty: Difficulty,
  excludeIds: Types.ObjectId[]
): Promise<IQuestion | null> {
  const [question] = await Question.aggregate([
    { $match: { difficulty, _id: { $nin: excludeIds } } },
    { $sample: { size: 1 } },
  ]);
  return question ? await Question.findById(question._id) : null;
}
