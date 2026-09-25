import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../lib/env';
import { Difficulty } from '../../models/question.model';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export interface GeneratedQuestion {
  title: string;
  topic: string;
  statement: string;
  hints: string[];
}

/**
 * Asks Gemini for one fresh DSA question at the given difficulty,
 * avoiding titles you've already been sent. Returns parsed, validated
 * JSON — never raw model text — so a malformed response fails loudly
 * instead of silently corrupting the DB.
 */
export async function generateQuestion(
  difficulty: Difficulty,
  avoidTitles: string[]
): Promise<GeneratedQuestion> {
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const avoidList = avoidTitles.length
    ? `Do NOT repeat any of these already-sent titles: ${avoidTitles.slice(-50).join(', ')}.`
    : '';

  const prompt = `You are generating ONE Data Structures & Algorithms practice question for a coding-interview prep tool.

Difficulty: "${difficulty}" (easy = fundamentals like arrays/strings/hashmaps solvable in <15 min; medium = classic interview problems like sliding window, graphs, DP intro; hard = advanced DP, complex graph algorithms, hard two-pointer/binary-search).

${avoidList}

Return ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{
  "title": "short problem name",
  "topic": "one or two words, e.g. Arrays, Graphs, Dynamic Programming",
  "statement": "the full problem statement, 2-5 sentences, self-contained, no external links needed",
  "hints": ["one short hint", "an optional second hint"]
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Gemini returned non-JSON output: ${raw.slice(0, 200)}`);
  }

  return validateGeneratedQuestion(parsed);
}

function validateGeneratedQuestion(data: unknown): GeneratedQuestion {
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as any).title !== 'string' ||
    typeof (data as any).topic !== 'string' ||
    typeof (data as any).statement !== 'string' ||
    !Array.isArray((data as any).hints)
  ) {
    throw new Error('Gemini response failed shape validation');
  }

  const d = data as GeneratedQuestion;
  return {
    title: d.title.trim(),
    topic: d.topic.trim(),
    statement: d.statement.trim(),
    hints: d.hints.filter((h): h is string => typeof h === 'string').map((h) => h.trim()),
  };
}
