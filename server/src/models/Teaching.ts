import mongoose, { Document, Schema } from 'mongoose';

export interface ITeaching extends Document {
  _id: mongoose.Types.ObjectId;
  courseName: string;
  courseCode?: string;
  institution: string;
  level: 'Undergraduate' | 'Postgraduate' | 'PhD' | 'Online' | 'Other';
  semester?: string;
  year?: number;
  description?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ITeaching>(
  {
    courseName: { type: String, required: true, trim: true },
    courseCode: { type: String, trim: true },
    institution: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Undergraduate', 'Postgraduate', 'PhD', 'Online', 'Other'],
      default: 'Undergraduate',
    },
    semester: { type: String, trim: true },
    year: { type: Number },
    description: { type: String },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ displayOrder: 1 });
schema.index({ year: -1 });
schema.index({ title: 'text' });

export const Teaching = mongoose.model<ITeaching>('Teaching', schema);
