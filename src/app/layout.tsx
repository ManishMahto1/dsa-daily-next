import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daily DSA — Master Algorithms One Day at a Time',
  description: 'Adaptive daily DSA challenges powered by Gemini with automated tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
