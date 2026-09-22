import mongoose, { Document, Schema } from 'mongoose';

export type ContactStatus = 'New' | 'Read' | 'Replied' | 'Archived' | 'Spam';

export interface IContactMessage extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  ipAddress?: string;
  userAgent?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['New', 'Read', 'Replied', 'Archived', 'Spam'],
      default: 'New',
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

schema.index({ status: 1 });
schema.index({ createdAt: -1 });

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', schema);
