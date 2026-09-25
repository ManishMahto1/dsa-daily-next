'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: '80px auto',
        padding: '32px 28px',
        background: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 16,
        textAlign: 'center',
        color: '#f8fafc',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#f87171' }}>
        Database Connection Notice
      </h2>
      <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
        {error.message || 'Could not connect to the database. Please ensure your environment variables are configured in Vercel.'}
      </p>

      <div
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: 16,
          textAlign: 'left',
          fontSize: 13,
          color: '#94a3b8',
          marginBottom: 24,
        }}
      >
        <strong style={{ color: '#f1f5f9', display: 'block', marginBottom: 6 }}>
          How to configure in Vercel:
        </strong>
        <ol style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Go to your Vercel Dashboard ➔ <strong>Settings</strong> ➔ <strong>Environment Variables</strong>.</li>
          <li>Add <code>MONGO_URI</code> with your MongoDB Atlas connection string.</li>
          <li>Make sure Network Access in MongoDB Atlas has <code>0.0.0.0/0</code> allowed.</li>
        </ol>
      </div>

      <button
        onClick={() => reset()}
        style={{
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          padding: '10px 24px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reload Page
      </button>
    </div>
  );
}
