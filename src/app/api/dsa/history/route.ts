import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';
import { Question, IQuestion } from '@/models/question.model';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const deliveries = await Delivery.find()
    .sort({ createdAt: -1 })
    .populate<{ questionId: IQuestion }>('questionId');

  return NextResponse.json({ success: true, data: deliveries });
}
