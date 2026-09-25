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
      setMessage(
        isCorrect
          ? `Nice — new level: ${json.data.progress.currentLevel}`
          : `Recorded. Current level: ${json.data.progress.currentLevel}`
      );
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'done') {
    return (
      <p style={{ fontSize: 14, color: '#16a34a', fontWeight: 600 }}>
        {message ?? 'Already answered.'}
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => submit(true)}
          disabled={status === 'submitting'}
          style={{
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          ✅ Solved it
        </button>
        <button
          onClick={() => submit(false)}
          disabled={status === 'submitting'}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          ❌ Couldn't solve it
        </button>
      </div>
      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{message}</p>
      )}
    </div>
  );
}
