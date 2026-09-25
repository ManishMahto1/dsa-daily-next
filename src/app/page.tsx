import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';
import { IQuestion } from '@/models/question.model';
import { getProgressSummary } from '@/modules/progress/progress.service';
import Link from 'next/link';
import TriggerButton from './TriggerButton';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await connectDB();

  const [latestDelivery, progress] = await Promise.all([
    Delivery.findOne().sort({ createdAt: -1 }).populate<{ questionId: IQuestion }>('questionId'),
    getProgressSummary(),
  ]);

  const latestQuestion = latestDelivery?.questionId;

  return (
    <main style={{ maxWidth: 840, margin: '0 auto', padding: '48px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#818cf8', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
          <span>✨</span> Powered by Gemini 3.6 & Next.js 16
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          Daily DSA
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 500 }}>
          Master algorithmic problem solving with tailored daily problems adapted to your streak and skill level.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Current Level
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                textTransform: 'capitalize',
                color:
                  progress.currentLevel === 'easy'
                    ? '#10b981'
                    : progress.currentLevel === 'medium'
                    ? '#f59e0b'
                    : '#ef4444',
              }}
            >
              {progress.currentLevel}
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Current Streak
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🔥</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>
              {progress.streak} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>days</span>
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Total Solved
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🎯</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>
              {progress.totalSolved}
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Accuracy
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>📊</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>
              {progress.accuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* Today's Challenge Section */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>Today's Question</h2>
          {latestDelivery && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
                background: latestDelivery.status === 'answered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: latestDelivery.status === 'answered' ? '#34d399' : '#fbbf24',
                border: `1px solid ${latestDelivery.status === 'answered' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              }}
            >
              {latestDelivery.status === 'answered' ? 'Completed' : 'Pending'}
            </span>
          )}
        </div>

        {latestDelivery && latestQuestion ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#818cf8',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                {latestQuestion.topic}
              </span>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                Level: <strong style={{ textTransform: 'capitalize' }}>{latestQuestion.difficulty}</strong>
              </span>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 18 }}>
              {latestQuestion.title}
            </h3>

            <Link
              href={`/dsa/${latestDelivery._id.toString()}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f8fafc',
                color: '#0f172a',
                textDecoration: 'none',
                padding: '12px 22px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{latestDelivery.status === 'answered' ? 'Review Problem' : 'Solve Problem'}</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
              No question has been generated yet today.
            </p>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              Your daily question sends automatically at 8:00 PM IST, or you can trigger one instantly below.
            </p>
          </div>
        )}
      </div>

      {/* Manual Trigger Section */}
      <div className="glass-panel" style={{ padding: '24px 32px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>
          Testing & Manual Triggers
        </h3>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
          Trigger Gemini question generation and queue an email send immediately without waiting for the 8PM cron.
        </p>
        <TriggerButton />
      </div>
    </main>
  );
}
