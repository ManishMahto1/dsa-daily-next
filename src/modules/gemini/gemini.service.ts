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
  const modelsToTry = [
    env.GEMINI_MODEL,
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  const avoidList = avoidTitles.length
    ? `Do NOT repeat any of these already-sent titles: ${avoidTitles.slice(-50).join(', ')}.`
    : '';

  const prompt = `You are a Principal Software Engineer crafting a top-tier Data Structures & Algorithms practice problem.

Target Difficulty: "${difficulty}"
- easy: fundamentals (arrays, hash maps, simple two pointers, string manipulation) solvable in <15 minutes.
- medium: standard interview classics (sliding window, binary search variations, trees, graphs BFS/DFS, two-pointer, DP intro).
- hard: advanced techniques (dynamic programming on trees/intervals, topological sort, monotonic stack, hard binary search).

${avoidList}

Instructions for output fields:
1. "title": Clean, canonical problem name (e.g. "Contains Duplicate", "Two Sum", "Valid Anagram", "Group Anagrams").
2. "topic": Main algorithmic topic (e.g. "Arrays & Hashing", "Two Pointers", "Sliding Window", "Binary Search", "Trees", "Dynamic Programming").
3. "statement": Complete problem description in Markdown with:
   - A clear explanation of the task, inputs, and outputs.
   - ### Examples
     Provide 2 to 3 detailed examples with Input, Output, and Explanation:
     Example 1:
     Input: nums = [1, 2, 3, 1]
     Output: true
     Explanation: 1 appears at indices 0 and 3.
   - ### Constraints
     Include clear mathematical constraints (e.g. 1 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9) and optimal target time/space complexities (e.g. Time: O(n), Space: O(n)).
4. "hints": Array of 2 to 3 progressive hints:
   - Hint 1: What is the initial brute force thought and its drawback?
   - Hint 2: What data structure or pattern allows achieving the optimal time/space complexity?
   - Hint 3: Key implementation details or edge cases to consider.

Return ONLY a valid JSON object matching this schema without markdown codeblock wrapper:
{
  "title": "Problem Title",
  "topic": "Topic Name",
  "statement": "Detailed Markdown string with problem description, Examples, and Constraints",
  "hints": ["Hint 1 text", "Hint 2 text", "Hint 3 text"]
}`;

  let lastError: unknown;
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const result = await model.generateContent(prompt);
      const raw = result.response.text();

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(`Gemini returned non-JSON output: ${raw.slice(0, 200)}`);
      }

      return validateGeneratedQuestion(parsed);
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini] Model ${modelName} failed, trying next fallback...`, err);
    }
  }

  throw lastError;
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
