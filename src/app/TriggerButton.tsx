'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TriggerButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleTrigger() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dsa/trigger', {
        method: 'POST',
        headers: {
          'x-dev-secret': 'changeme',
        },
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned error (${res.status})`);
      }
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to trigger job');
      }

      router.refresh();
      if (data.data?.deliveryId) {
        router.push(`/dsa/${data.data.deliveryId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={handleTrigger}
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '14px 24px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.75 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontSize: 16 }}>{loading ? '⏳' : '⚡'}</span>
        {loading ? 'Generating LeetCode-grade problem with Gemini...' : 'Generate New Question Now (Test)'}
      </button>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 10,
            color: '#f87171',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
