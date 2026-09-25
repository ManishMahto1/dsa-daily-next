import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';
import { IQuestion } from '@/models/question.model';
import SubmitAnswer from './SubmitAnswer';

export const dynamic = 'force-dynamic';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ deliveryId: string }>;
}) {
  const { deliveryId } = await params;
  await connectDB();

  const delivery = await Delivery.findById(deliveryId).populate<{
    questionId: IQuestion;
  }>('questionId');

  if (!delivery) notFound();

  const question = delivery.questionId;
  const color = DIFFICULTY_COLORS[question.difficulty] ?? '#64748b';

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <span
        style={{
          display: 'inline-block',
          background: `${color}22`,
          color,
          fontWeight: 600,
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 999,
          marginBottom: 12,
        }}
      >
        {question.difficulty.toUpperCase()} · {question.topic}
      </span>

      <h1 style={{ fontSize: 22, marginBottom: 16 }}>{question.title}</h1>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16,
          fontSize: 14,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          marginBottom: 20,
        }}
      >
        {question.statement}
      </div>

      {question.hints.length > 0 && (
        <details style={{ marginBottom: 24, fontSize: 13, color: '#475569' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Hints</summary>
          <ul>
            {question.hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </details>
      )}

      <SubmitAnswer
        deliveryId={delivery._id.toString()}
        alreadyAnswered={delivery.status === 'answered'}
      />
    </main>
  );
}
