import mongoose, { Document, Schema } from 'mongoose';

export type ServiceType =
  | 'Leadership'
  | 'Professional Service'
  | 'Editorial Board'
  | 'Conference Service'
  | 'Committee'
  | 'Reviewer'
  | 'Other';

export interface IServiceLeadership extends Document {
  _id: mongoose.Types.ObjectId;
  role: string;
  organization: string;
  type: ServiceType;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent: boolean;
  externalUrl?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IServiceLeadership>(
  {
    role: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        'Leadership',
        'Professional Service',
        'Editorial Board',
        'Conference Service',
        'Committee',
        'Reviewer',
        'Other',
      ],
    },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    externalUrl: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ type: 1 });
schema.index({ displayOrder: 1 });

export const ServiceLeadership = mongoose.model<IServiceLeadership>(
  'ServiceLeadership',
  schema
);
