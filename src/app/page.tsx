import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';
import { getProgressSummary } from '@/modules/progress/progress.service';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await connectDB();

  const [latest, progress] = await Promise.all([
    Delivery.findOne().sort({ createdAt: -1 }).populate('questionId'),
    getProgressSummary(),
  ]);

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 22 }}>Daily DSA</h1>

      <div
        style={{
          display: 'flex',
          gap: 16,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          fontSize: 14,
        }}
      >
        <span>
          Level: <strong>{progress.currentLevel}</strong>
        </span>
        <span>
          Streak: <strong>{progress.streak}</strong>
        </span>
        <span>
          Solved: <strong>{progress.totalSolved}</strong>
        </span>
        <span>
          Accuracy: <strong>{progress.accuracy}%</strong>
        </span>
      </div>

      {latest ? (
        <Link
          href={`/dsa/${latest._id.toString()}`}
          style={{
            display: 'inline-block',
            background: '#0f172a',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Open latest question →
        </Link>
      ) : (
        <p style={{ color: '#64748b', fontSize: 14 }}>
          No question sent yet. Trigger the daily job or wait for 8PM.
        </p>
      )}
    </main>
  );
}
