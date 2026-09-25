import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getProgressSummary } from '@/modules/progress/progress.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const summary = await getProgressSummary();
  return NextResponse.json({ success: true, data: summary });
}
