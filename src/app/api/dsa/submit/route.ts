import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { submitAnswer } from '@/modules/progress/progress.service';

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json().catch(() => null);
  const { deliveryId, isCorrect } = body ?? {};

  if (!deliveryId || typeof isCorrect !== 'boolean') {
    return NextResponse.json(
      { success: false, message: 'deliveryId (string) and isCorrect (boolean) are required' },
      { status: 400 }
    );
  }

  try {
    const result = await submitAnswer({ deliveryId, isCorrect });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
