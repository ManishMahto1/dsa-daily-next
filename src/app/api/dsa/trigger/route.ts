import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { runDailyDsaJob } from '@/jobs/dailyDsa.job';
import { env } from '@/lib/env';

/**
 * Manually fires the daily job — for local testing without waiting for
 * 8PM. This runs question-picking + Gemini generation + email queuing
 * directly (it does NOT go through BullMQ), so it works even without
 * the worker process running, though you still need the worker running
 * to actually process the queued email job.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-dev-secret');
  if (secret !== env.DEV_TRIGGER_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const result = await runDailyDsaJob();

  return NextResponse.json({
    success: true,
    message: 'Daily DSA job triggered manually — email queued (worker process sends it)',
    data: result,
  });
}
