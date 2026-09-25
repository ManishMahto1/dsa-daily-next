import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily DSA',
  description: 'One DSA question a day, gradually increasing in difficulty.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: '-apple-system, Segoe UI, Roboto, sans-serif',
          background: '#f8fafc',
          color: '#0f172a',
        }}
      >
        {children}
      </body>
    </html>
  );
}
