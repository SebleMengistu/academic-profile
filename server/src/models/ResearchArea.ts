import mongoose, { Document, Schema } from 'mongoose';

export interface IResearchArea extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IResearchArea>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    icon: { type: String },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ slug: 1 }, { unique: true });
schema.index({ displayOrder: 1 });
schema.index({ '$**': 'text' });

export const ResearchArea = mongoose.model<IResearchArea>('ResearchArea', schema);
