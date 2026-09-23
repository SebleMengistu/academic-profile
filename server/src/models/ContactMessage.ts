import mongoose, { Document, Schema } from 'mongoose';
export interface IContactMessage extends Document { _id: mongoose.Types.ObjectId; name: string; email: string; subject?: string; message: string; status: string; ipAddress?: string; userAgent?: string; repliedAt?: Date; createdAt: Date; updatedAt: Date; }
const schema = new Schema<IContactMessage>({ name: { type: String, required: true }, email: { type: String, required: true }, subject: String, message: { type: String, required: true }, status: { type: String, enum: ['New','Read','Replied','Archived','Spam'], default: 'New' }, ipAddress: String, userAgent: String, repliedAt: Date }, { timestamps: true });
schema.index({ status: 1 }); schema.index({ createdAt: -1 });
export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', schema);
