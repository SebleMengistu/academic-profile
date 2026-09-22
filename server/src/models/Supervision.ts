import mongoose, { Document, Schema } from 'mongoose';

export type SupervisionStatus = 'Current' | 'Completed' | 'Withdrawn';

export interface ISupervision extends Document {
  _id: mongoose.Types.ObjectId;
  studentName: string;
  degree: 'PhD' | 'Masters' | 'Honours' | 'Undergraduate' | 'Other';
  researchTopic: string;
  role: 'Principal Supervisor' | 'Associate Supervisor' | 'Co-Supervisor' | 'Advisor';
  startDate?: Date;
  completionDate?: Date;
  status: SupervisionStatus;
  coSupervisors?: string[];
  description?: string;
  institution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ISupervision>(
  {
    studentName: { type: String, required: true, trim: true },
    degree: {
      type: String,
      required: true,
      enum: ['PhD', 'Masters', 'Honours', 'Undergraduate', 'Other'],
    },
    researchTopic: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ['Principal Supervisor', 'Associate Supervisor', 'Co-Supervisor', 'Advisor'],
    },
    startDate: { type: Date },
    completionDate: { type: Date },
    status: {
      type: String,
      enum: ['Current', 'Completed', 'Withdrawn'],
      default: 'Current',
    },
    coSupervisors: [{ type: String, trim: true }],
    description: { type: String },
    institution: { type: String, trim: true },
  },
  { timestamps: true }
);

schema.index({ status: 1 });
schema.index({ startDate: -1 });

export const Supervision = mongoose.model<ISupervision>('Supervision', schema);
