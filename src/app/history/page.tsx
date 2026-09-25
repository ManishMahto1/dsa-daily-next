import { connectDB } from '@/lib/db';
import { Delivery } from '@/models/delivery.model';
import { IQuestion } from '@/models/question.model';
import HistoryView, { HistoryItem } from './HistoryView';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  let deliveries: any[] = [];
  try {
    await connectDB();
    deliveries = await Delivery.find()
      .sort({ createdAt: -1 })
      .populate<{ questionId: IQuestion }>('questionId');
  } catch (err) {
    console.error('[HistoryPage] DB query failed:', err);
  }

  const items: HistoryItem[] = deliveries.map((d) => {
    const q = d.questionId as unknown as IQuestion;
    return {
      id: d._id.toString(),
      questionId: q?._id ? q._id.toString() : '',
      title: q?.title ?? 'Untitled Problem',
      topic: q?.topic ?? 'General',
      difficulty: (q?.difficulty ?? d.difficultyAtSend ?? 'easy') as 'easy' | 'medium' | 'hard',
      status: d.status,
      isCorrect: d.isCorrect,
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
      answeredAt: d.answeredAt ? d.answeredAt.toISOString() : undefined,
    };
  });

  return <HistoryView initialItems={items} />;
}
