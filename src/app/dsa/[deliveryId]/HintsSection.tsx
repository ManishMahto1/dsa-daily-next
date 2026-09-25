'use client';

import { useState } from 'react';

export default function HintsSection({ hints }: { hints: string[] }) {
  const [unlockedIndex, setUnlockedIndex] = useState<number>(-1);

  if (!hints || hints.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          color: '#cbd5e1',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span>💡</span> Progressive Hints ({hints.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {hints.map((hint, idx) => {
          const isOpen = unlockedIndex >= idx;
          return (
            <div
              key={idx}
              style={{
                background: isOpen ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.4)',
                border: `1px solid ${isOpen ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              <button
                type="button"
                onClick={() => setUnlockedIndex(isOpen ? idx - 1 : idx)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: isOpen ? '#e2e8f0' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      background: isOpen ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: 11,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {idx + 1}
                  </span>
                  Hint {idx + 1}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {isOpen ? 'Hide ▲' : 'Reveal ▼'}
                </span>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 16px 14px 44px',
                    fontSize: 13.5,
                    color: '#cbd5e1',
                    lineHeight: 1.6,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: 10,
                  }}
                >
                  {hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
