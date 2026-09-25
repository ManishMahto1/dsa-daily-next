'use client';

import { useState } from 'react';

export default function SubmitAnswer({
  deliveryId,
  alreadyAnswered,
}: {
  deliveryId: string;
  alreadyAnswered: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>(
    alreadyAnswered ? 'done' : 'idle'
  );
  const [result, setResult] = useState<{ isCorrect: boolean; level: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(isCorrect: boolean) {
    setStatus('submitting');
    try {
      const res = await fetch('/api/dsa/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId, isCorrect }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setStatus('done');
      setResult({
        isCorrect,
        level: json.data?.progress?.currentLevel ?? 'easy',
      });
      setMessage(
        isCorrect
          ? `🎉 Great job! Streak incremented. Current Level: ${json.data.progress.currentLevel}`
          : `📚 Recorded! Keep going — consistency is key. Current Level: ${json.data.progress.currentLevel}`
      );
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'done') {
    const isSuccess = result ? result.isCorrect : true;
    return (
      <div
        style={{
          background: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 22 }}>{isSuccess ? '🏆' : '📖'}</span>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isSuccess ? '#34d399' : '#f87171',
            }}
          >
            {message ?? 'Response already recorded.'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
            Progress updated in your daily statistics.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', marginBottom: 14 }}>
        Did you solve this problem?
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <button
          onClick={() => submit(true)}
          disabled={status === 'submitting'}
          style={{
            flex: '1 1 180px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 20px',
            fontWeight: 600,
            fontSize: 14,
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            opacity: status === 'submitting' ? 0.6 : 1,
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <span>✅</span> Solved it
        </button>

        <button
          onClick={() => submit(false)}
          disabled={status === 'submitting'}
          style={{
            flex: '1 1 180px',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '12px 20px',
            fontWeight: 600,
            fontSize: 14,
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            opacity: status === 'submitting' ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.15s ease',
          }}
        >
          <span>❌</span> Need more practice
        </button>
      </div>

      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⚠️</span> {message}
        </p>
      )}
    </div>
  );
}
