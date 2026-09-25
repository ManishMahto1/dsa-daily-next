import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  const { deliveryId } = await params;
  await connectDB();

  const delivery = await Delivery.findById(deliveryId).populate('questionId');
  if (!delivery) {
    return NextResponse.json({ success: false, message: 'Delivery not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: delivery });
}
