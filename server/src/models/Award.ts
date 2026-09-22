import mongoose, { Document, Schema } from 'mongoose';

export interface IAward extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  organization: string;
  date?: Date;
  category?: string;
  description?: string;
  certificateUrl?: string;
  certificatePublicId?: string;
  externalUrl?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAward>(
  {
    name: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    date: { type: Date },
    category: { type: String, trim: true },
    description: { type: String },
    certificateUrl: { type: String },
    certificatePublicId: { type: String },
    externalUrl: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ date: -1 });
schema.index({ displayOrder: 1 });

export const Award = mongoose.model<IAward>('Award', schema);
