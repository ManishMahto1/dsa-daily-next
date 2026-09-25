import { IQuestion } from '../../../models/question.model';
import { env } from '../../../lib/env';

interface TemplateInput {
  question: IQuestion;
  deliveryId: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

export function buildDailyQuestionEmail({ question, deliveryId }: TemplateInput) {
  const color = DIFFICULTY_COLORS[question.difficulty] ?? '#64748b';
  const pageUrl = `${env.FRONTEND_BASE_URL}/dsa/${deliveryId}`;

  const subject = `🧠 Today's DSA — ${question.title} (${question.difficulty.toUpperCase()})`;

  const html = `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
    <p style="font-size:13px; letter-spacing:0.06em; text-transform:uppercase; color:#64748b; margin:0 0 8px;">
      Daily DSA · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
    </p>
    <h1 style="font-size:22px; margin:0 0 4px;">${escapeHtml(question.title)}</h1>
    <span style="display:inline-block; background:${color}22; color:${color}; font-weight:600; font-size:12px; padding:4px 10px; border-radius:999px; margin-bottom:16px;">
      ${question.difficulty.toUpperCase()} · ${escapeHtml(question.topic)}
    </span>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; white-space:pre-wrap; font-size:14px; line-height:1.6; margin-bottom:20px;">
      ${escapeHtml(question.statement)}
    </div>
    <a href="${pageUrl}"
       style="display:inline-block; background:#0f172a; color:#fff; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600; font-size:14px;">
      Solve it →
    </a>
    <p style="font-size:12px; color:#94a3b8; margin-top:24px;">
      Answer on the page to update your streak and unlock the next difficulty level.
    </p>
  </div>`;

  const text = `Today's DSA question: ${question.title} (${question.difficulty})\n\n${question.statement}\n\nSolve it: ${pageUrl}`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
