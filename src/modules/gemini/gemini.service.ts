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
- "school": Absolute basic programming fundamentals for school/beginners. Concepts: basic loops (for/while), conditionals (if/else), basic arithmetic, single array traversal, basic string counting. Examples: Find Maximum in an Array, Sum of Digits of a Number, Reverse a Number, Check Palindrome Number, Count Even and Odd Numbers in Array, Factorial of a Number, Check Prime Number, Count Vowels in a String, Sum of Array Elements.
- "college": Foundational Computer Science curriculum & intro Data Structures. Concepts: Linear Search, Binary Search on sorted arrays, Bubble/Selection Sort, In-Place Array Reversal, Find Missing Number from 1 to N, Second Largest Element in Array, Remove Duplicates from Sorted Array, Check Anagram using Frequency Counting, Basic Linked List Traversal.
- "easy": Standard LeetCode Easy interview fundamentals (e.g. Two Sum, Contains Duplicate, Valid Parentheses, Best Time to Buy and Sell Stock).
- "medium": Standard interview staples (Sliding Window, Binary Search variations, Trees, Graphs BFS/DFS, Two-Pointer, Dynamic Programming intro).
- "hard": Advanced techniques (Complex DP on trees/grids, Topological Sort, Monotonic Stack, Hard Graph Algorithms).

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

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  let lastError: unknown;
  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
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
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] Model ${modelName} attempt ${attempt} failed: ${err.message}`);
        if (attempt < 2) {
          await sleep(1500);
        }
      }
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
