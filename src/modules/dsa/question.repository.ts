import { Types } from 'mongoose';
import { Question, Difficulty, IQuestion } from '../../models/question.model';
import { generateQuestion } from '../gemini/gemini.service';

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Question sourcing strategy:
 *  1. Look for an existing, unseen question at this difficulty in Mongo
 *     (questions that have NEVER been delivered to the user).
 *  2. If the pool has no unseen questions, ask Gemini for a brand-new, unique one.
 *  3. Ensure the newly generated title is strictly unique across the entire database.
 */
export async function findOrGenerateQuestion(
  difficulty: Difficulty,
  excludeIds: Types.ObjectId[]
): Promise<IQuestion> {
  const existing = await findUnseenExisting(difficulty, excludeIds);
  if (existing) return existing;

  // Pass all previously generated and delivered question titles to avoid repeating
  const existingQuestions = await Question.find().select('title').lean();
  const avoidTitles = existingQuestions.map((q) => q.title);

  let generated = await generateQuestion(difficulty, avoidTitles);

  // Check for collision against existing database questions
  let attempts = 0;
  while (attempts < 3) {
    const duplicate = await Question.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(generated.title.trim())}$`, 'i') },
    });
    if (!duplicate) break;

    // Title already exists, add to avoid list and regenerate
    avoidTitles.push(generated.title);
    attempts++;
    generated = await generateQuestion(difficulty, avoidTitles);
  }

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
