import { Schema, model, models, Document, Types, Model } from 'mongoose';
import { Difficulty } from './question.model';

// Single-user system — this collection only ever holds ONE document.
export interface IProgress extends Document {
  _id: Types.ObjectId;
  currentLevel: Difficulty;
  streak: number;
  missStreak: number;
  totalSolved: number;
  totalAttempted: number;
  solvedIds: Types.ObjectId[];
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    currentLevel: {
      type: String,
      enum: ['school', 'college', 'easy', 'medium', 'hard'],
      default: 'school',
    },
    streak: { type: Number, default: 0 },
    missStreak: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    solvedIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  },
  { timestamps: true }
);

export const Progress: Model<IProgress> =
  models.Progress || model<IProgress>('Progress', ProgressSchema);

export async function getOrCreateProgress(): Promise<IProgress> {
  let progress = await Progress.findOne();
  if (!progress) progress = await Progress.create({});
  return progress;
}
