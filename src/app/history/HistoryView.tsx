'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export interface HistoryItem {
  id: string;
  questionId: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'sent' | 'failed' | 'answered';
  isCorrect?: boolean;
  createdAt: string;
  answeredAt?: string;
}

const DIFFICULTY_STYLES = {
  easy: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
  medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  hard: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
};

export default function HistoryView({ initialItems }: { initialItems: HistoryItem[] }) {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      // Search filter
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.topic.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && item.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'solved' && (!item.isCorrect || item.status !== 'answered')) {
        return false;
      }
      if (selectedStatus === 'unsolved' && (item.isCorrect !== false || item.status !== 'answered')) {
        return false;
      }
      if (selectedStatus === 'pending' && item.status === 'answered') {
        return false;
      }

      return true;
    });
  }, [initialItems, search, selectedDifficulty, selectedStatus]);

  const solvedCount = initialItems.filter((i) => i.status === 'answered' && i.isCorrect).length;
  const attemptedCount = initialItems.filter((i) => i.status === 'answered').length;
  const accuracy = attemptedCount > 0 ? Math.round((solvedCount / attemptedCount) * 100) : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
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
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span>←</span> Back to Dashboard
        </Link>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {initialItems.length} total questions recorded
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          Question History & Progress
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Browse all daily challenges sent to you, review problems, and track your historical performance.
        </p>
      </div>

      {/* Stats Quick Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            Delivered
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
            {initialItems.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            Solved
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            {solvedCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            Accuracy Rate
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#818cf8', marginTop: 4 }}>
            {accuracy}%
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 20px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search questions by title or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: '12px 16px',
            color: '#f8fafc',
            fontSize: 14,
            outline: 'none',
          }}
        />

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginRight: 4 }}>Status:</span>
          {['all', 'solved', 'unsolved', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                background: selectedStatus === st ? '#4f46e5' : 'rgba(255, 255, 255, 0.04)',
                color: selectedStatus === st ? '#fff' : '#94a3b8',
                border: `1px solid ${selectedStatus === st ? '#6366f1' : 'rgba(255, 255, 255, 0.08)'}`,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st === 'all'
                ? 'All Statuses'
                : st === 'solved'
                ? '✅ Solved'
                : st === 'unsolved'
                ? '❌ Need Practice'
                : '⏳ Pending'}
            </button>
          ))}

          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginLeft: 12, marginRight: 4 }}>
            Difficulty:
          </span>
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                background: selectedDifficulty === diff ? '#334155' : 'rgba(255, 255, 255, 0.04)',
                color: selectedDifficulty === diff ? '#f8fafc' : '#94a3b8',
                border: `1px solid ${selectedDifficulty === diff ? '#64748b' : 'rgba(255, 255, 255, 0.08)'}`,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {filteredItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredItems.map((item) => {
            const diffStyle = DIFFICULTY_STYLES[item.difficulty] ?? DIFFICULTY_STYLES.easy;
            const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        background: diffStyle.bg,
                        color: diffStyle.color,
                        border: `1px solid ${diffStyle.border}`,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.difficulty}
                    </span>
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#818cf8',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {item.topic}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{dateStr}</span>
                  </div>

                  <Link
                    href={`/dsa/${item.id}`}
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#f8fafc',
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    {item.title}
                  </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {item.status === 'answered' ? (
                    item.isCorrect ? (
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        ✅ Solved
                      </span>
                    ) : (
                      <span
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        ❌ Need Practice
                      </span>
                    )
                  ) : (
                    <span
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      ⏳ Pending
                    </span>
                  )}

                  <Link
                    href={`/dsa/${item.id}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#f8fafc',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{item.status === 'answered' ? 'Review' : 'Solve'}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 8 }}>
            No questions matched your search or filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDifficulty('all');
              setSelectedStatus('all');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
