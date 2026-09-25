import { Schema, model, models, Document, Types, Model } from 'mongoose';

export type Difficulty = 'school' | 'college' | 'easy' | 'medium' | 'hard';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  title: string;
  difficulty: Difficulty;
  topic: string;
  statement: string;
  hints: string[];
  source: 'gemini' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['school', 'college', 'easy', 'medium', 'hard'],
      required: true,
      index: true,
    },
    topic: { type: String, required: true, trim: true, index: true },
    statement: { type: String, required: true },
    hints: { type: [String], default: [] },
    source: { type: String, enum: ['gemini', 'manual'], default: 'gemini' },
  },
  { timestamps: true }
);

// Reset cached model on hot reload so updated enum values take effect immediately
if (models.Question) {
  delete (models as unknown as Record<string, unknown>).Question;
}
export const Question: Model<IQuestion> = model<IQuestion>('Question', QuestionSchema);
