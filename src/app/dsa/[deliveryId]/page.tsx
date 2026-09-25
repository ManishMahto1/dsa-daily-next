import { notFound } from 'next/navigation';
import { isValidObjectId } from 'mongoose';
import Link from 'next/link';
import { marked } from 'marked';
import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';
import { Question, IQuestion } from '@/models/question.model';
import SubmitAnswer from './SubmitAnswer';
import HintsSection from './HintsSection';

export const dynamic = 'force-dynamic';

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  school: {
    label: 'School (Beginner)',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
  },
  college: {
    label: 'College (Foundation)',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.3)',
  },
  easy: {
    label: 'Easy',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  hard: {
    label: 'Hard',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
};

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ deliveryId: string }>;
}) {
  const { deliveryId } = await params;
  if (!isValidObjectId(deliveryId)) {
    notFound();
  }

  await connectDB();

  const delivery = await Delivery.findById(deliveryId).populate<{
    questionId: IQuestion;
  }>('questionId');

  if (!delivery) notFound();

  const question = delivery.questionId;
  const diff = DIFFICULTY_CONFIG[question.difficulty] ?? DIFFICULTY_CONFIG.easy;

  // Convert markdown problem statement to HTML
  const statementHtml = await marked.parse(question.statement);

  return (
    <main style={{ maxWidth: 840, margin: '0 auto', padding: '36px 20px' }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
            padding: '6px 12px',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span>←</span> Back to Dashboard
        </Link>
      </div>

      {/* Main Problem Card */}
      <article className="glass-panel" style={{ padding: '32px 36px', marginBottom: 24 }}>
        {/* Header tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <span
            style={{
              background: diff.bg,
              color: diff.color,
              border: `1px solid ${diff.border}`,
              fontWeight: 700,
              fontSize: 12,
              padding: '4px 12px',
              borderRadius: 999,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            {diff.label}
          </span>
          <span
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontWeight: 600,
              fontSize: 12,
              padding: '4px 12px',
              borderRadius: 999,
            }}
          >
            {question.topic}
          </span>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
            Daily DSA Challenge
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#f8fafc',
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}
        >
          {question.title}
        </h1>

        {/* Formatted Markdown Problem Statement */}
        <div
          className="prose-dsa"
          style={{ marginBottom: 32 }}
          dangerouslySetInnerHTML={{ __html: statementHtml }}
        />

        {/* Hints Accordion */}
        <HintsSection hints={question.hints} />

        {/* Submit action */}
        <SubmitAnswer
          deliveryId={delivery._id.toString()}
          alreadyAnswered={delivery.status === 'answered'}
        />
      </article>
    </main>
  );
}
