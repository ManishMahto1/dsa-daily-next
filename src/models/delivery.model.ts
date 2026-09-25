import { Schema, model, models, Document, Types, Model } from 'mongoose';

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'answered';

export interface IDelivery extends Document {
  _id: Types.ObjectId;
  questionId: Types.ObjectId;
  difficultyAtSend: string;
  status: DeliveryStatus;
  sentAt?: Date;
  answeredAt?: Date;
  isCorrect?: boolean;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    difficultyAtSend: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'answered'],
      default: 'pending',
      index: true,
    },
    sentAt: { type: Date },
    answeredAt: { type: Date },
    isCorrect: { type: Boolean },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

if (models.Delivery) {
  delete (models as unknown as Record<string, unknown>).Delivery;
}
export const Delivery: Model<IDelivery> = model<IDelivery>('Delivery', DeliverySchema);
