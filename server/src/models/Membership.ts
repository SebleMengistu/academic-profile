import mongoose, { Document, Schema } from 'mongoose';

export interface IMembership extends Document {
  _id: mongoose.Types.ObjectId;
  organization: string;
  role?: string;
  membershipType?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent: boolean;
  externalUrl?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMembership>(
  {
    organization: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    membershipType: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: true },
    externalUrl: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ displayOrder: 1 });

export const Membership = mongoose.model<IMembership>('Membership', schema);
