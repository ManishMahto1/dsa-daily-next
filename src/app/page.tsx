import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';
import { IQuestion } from '@/models/question.model';
import { getProgressSummary } from '@/modules/progress/progress.service';
import Link from 'next/link';
import TriggerButton from './TriggerButton';

export const dynamic = 'force-dynamic';

const DIFFICULTY_STYLES = {
  school: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
  college: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' },
  easy: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
  medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  hard: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
};

export default async function HomePage() {
  let dbError: string | null = null;
  let recentDeliveries: any[] = [];
  let totalCount = 0;
  let progress = {
    currentLevel: 'school' as const,
    streak: 0,
    missStreak: 0,
    totalSolved: 0,
    totalAttempted: 0,
    accuracy: 0,
  };

  try {
    await connectDB();
    const [deliveries, count, prog] = await Promise.all([
      Delivery.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate<{ questionId: IQuestion }>('questionId'),
      Delivery.countDocuments(),
      getProgressSummary(),
    ]);
    recentDeliveries = deliveries;
    totalCount = count;
    progress = prog as typeof progress;
  } catch (err: unknown) {
    dbError = err instanceof Error ? err.message : 'Database connection error';
    console.error('[HomePage] DB connection failed:', err);
  }

  const latestDelivery = recentDeliveries[0];
  const latestQuestion = latestDelivery?.questionId;

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 20px' }}>
      {/* Database Error Banner if not yet connected in Vercel */}
      {dbError && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            marginBottom: 28,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ MongoDB Connection Required</div>
          <div>{dbError}</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#cbd5e1' }}>
            Please add <code>MONGO_URI</code> to your Vercel Project <strong>Settings ➔ Environment Variables</strong> with your Atlas connection string, and ensure Network Access in Atlas is set to <code>0.0.0.0/0</code>.
          </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 999,
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: '#818cf8',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span>✨</span> Powered by Gemini 3.6 & Next.js 16
        </div>

        <Link
          href="/history"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#f8fafc',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>📚</span>
          <span>Question History ({totalCount})</span>
          <span>→</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div style={{ marginBottom: 36 }}>
        <h1
          style={{
            fontSize: 34,
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
        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 540 }}>
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
                fontSize: 20,
                fontWeight: 700,
                textTransform: 'capitalize',
                color:
                  progress.currentLevel === 'school'
                    ? '#06b6d4'
                    : progress.currentLevel === 'college'
                    ? '#8b5cf6'
                    : progress.currentLevel === 'easy'
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
              {progress.totalSolved} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>/ {totalCount}</span>
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

      {/* Learning Progression Roadmap */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
            Curriculum Path: <span style={{ color: '#f8fafc' }}>From Scratch to Mastery</span>
          </div>
          <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
            Solve 3 in a row to level up ➔
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { key: 'school', label: '1. School Level', desc: 'Loops, Math, Logic', color: '#06b6d4' },
            { key: 'college', label: '2. College Level', desc: 'Arrays, Search, Sort', color: '#8b5cf6' },
            { key: 'easy', label: '3. LeetCode Easy', desc: 'HashMaps, Pointers', color: '#10b981' },
            { key: 'medium', label: '4. LeetCode Med', desc: 'Trees, Graphs, DP', color: '#f59e0b' },
            { key: 'hard', label: '5. LeetCode Hard', desc: 'Advanced Graphs/DP', color: '#ef4444' },
          ].map((lvl) => {
            const isCurrent = progress.currentLevel === lvl.key;
            return (
              <div
                key={lvl.key}
                style={{
                  flex: '1 1 140px',
                  minWidth: 135,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: isCurrent ? `${lvl.color}22` : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isCurrent ? lvl.color : 'rgba(255, 255, 255, 0.06)'}`,
                  boxShadow: isCurrent ? `0 0 16px ${lvl.color}33` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? lvl.color : '#94a3b8' }}>
                    {lvl.label}
                  </span>
                  {isCurrent && (
                    <span style={{ fontSize: 9, background: lvl.color, color: '#000', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{lvl.desc}</div>
              </div>
            );
          })}
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
                padding: '4px 12px',
                borderRadius: 999,
                background:
                  latestDelivery.status === 'answered'
                    ? latestDelivery.isCorrect
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                color:
                  latestDelivery.status === 'answered'
                    ? latestDelivery.isCorrect
                      ? '#34d399'
                      : '#f87171'
                    : '#fbbf24',
                border: `1px solid ${
                  latestDelivery.status === 'answered'
                    ? latestDelivery.isCorrect
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(245, 158, 11, 0.3)'
                }`,
              }}
            >
              {latestDelivery.status === 'answered'
                ? latestDelivery.isCorrect
                  ? '✅ Solved'
                  : '❌ Need Practice'
                : '⏳ Pending'}
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

            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
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
                padding: '12px 24px',
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
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
              No question has been generated yet today.
            </p>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              Your daily question sends automatically at 8:00 PM IST, or you can trigger one instantly below.
            </p>
          </div>
        )}
      </div>

      {/* Recent Questions Preview */}
      {recentDeliveries.length > 1 && (
        <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
              Recent Questions History
            </h3>
            <Link
              href="/history"
              style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}
            >
              View All ({totalCount}) →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentDeliveries.slice(0, 5).map((d) => {
              const q = d.questionId;
              if (!q) return null;
              const diffStyle =
                DIFFICULTY_STYLES[q.difficulty as 'easy' | 'medium' | 'hard'] ?? DIFFICULTY_STYLES.easy;

              return (
                <div
                  key={d._id.toString()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        background: diffStyle.bg,
                        color: diffStyle.color,
                        border: `1px solid ${diffStyle.border}`,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                      }}
                    >
                      {q.difficulty}
                    </span>
                    <Link
                      href={`/dsa/${d._id.toString()}`}
                      style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
                    >
                      {q.title}
                    </Link>
                    <span style={{ fontSize: 12, color: '#64748b' }}>({q.topic})</span>
                  </div>

                  <div>
                    {d.status === 'answered' ? (
                      d.isCorrect ? (
                        <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>✅ Solved</span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>❌ Missed</span>
                      )
                    ) : (
                      <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>⏳ Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
