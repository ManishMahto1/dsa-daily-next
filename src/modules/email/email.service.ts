import { Resend } from 'resend';
import { env } from '../../lib/env';
import { IQuestion } from '../../models/question.model';
import { buildDailyQuestionEmail } from './templates/dailyQuestion.template';

const resend = new Resend(env.RESEND_API_KEY || 're_placeholder_for_build');

export async function sendDailyQuestionEmail(question: IQuestion, deliveryId: string) {
  const { subject, html, text } = buildDailyQuestionEmail({ question, deliveryId });

  const { data, error } = await resend.emails.send({
    from: env.SENDER_EMAIL,
    to: env.RECIPIENT_EMAIL,
    subject,
    html,
    text,
  });

  if (error) throw new Error(`Resend error: ${error.message ?? 'unknown'}`);
  return data;
}
