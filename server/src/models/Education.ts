import mongoose, { Document, Schema } from 'mongoose';

export interface IEducation extends Document {
  _id: mongoose.Types.ObjectId;
  degree: string;
  field: string;
  institution: string;
  location?: string;
  country?: string;
  startDate?: Date;
  completionDate?: Date;
  thesisTitle?: string;
  thesisUrl?: string;
  description?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IEducation>(
  {
    degree: { type: String, required: true, trim: true },
    field: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    country: { type: String, trim: true },
    startDate: { type: Date },
    completionDate: { type: Date },
    thesisTitle: { type: String, trim: true },
    thesisUrl: { type: String, trim: true },
    description: { type: String },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ displayOrder: 1 });

export const Education = mongoose.model<IEducation>('Education', schema);
