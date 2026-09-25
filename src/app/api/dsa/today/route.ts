import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();

  const delivery = await Delivery.findOne().sort({ createdAt: -1 }).populate('questionId');
  if (!delivery) {
    return NextResponse.json({ success: false, message: 'No delivery yet' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: delivery });
}
