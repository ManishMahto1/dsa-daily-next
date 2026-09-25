import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { runDailyDsaJob } from '@/jobs/dailyDsa.job';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

async function executeTrigger(req: NextRequest) {
  // Check authorization: support x-dev-secret header or Vercel Cron Authorization header
  const devSecret = req.headers.get('x-dev-secret');
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  const isDevSecretValid = devSecret === env.DEV_TRIGGER_SECRET;
  const isVercelCronValid = cronSecret && authHeader === `Bearer ${cronSecret}`;

  // Allow trigger if dev-secret matches or Vercel Cron header matches
  if (!isDevSecretValid && !isVercelCronValid) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const result = await runDailyDsaJob({ sendImmediately: true });

    return NextResponse.json({
      success: true,
      message: 'Daily DSA job executed successfully and email dispatched via Resend',
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// Handlers for both POST (UI/manual test) and GET (Vercel Cron)
export async function POST(req: NextRequest) {
  return executeTrigger(req);
}

export async function GET(req: NextRequest) {
  return executeTrigger(req);
}
