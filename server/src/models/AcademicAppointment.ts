import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  institution: string;
  faculty?: string;
  department?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAcademicAppointment>(
  {
    title: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    faculty: { type: String, trim: true },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ displayOrder: 1 });

export const AcademicAppointment = mongoose.model<IAcademicAppointment>(
  'AcademicAppointment',
  schema
);
