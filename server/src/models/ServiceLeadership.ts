import mongoose, { Document, Schema } from 'mongoose';
export interface IServiceLeadership extends Document { _id: mongoose.Types.ObjectId; role: string; organization: string; type: string; description?: string; startDate?: Date; endDate?: Date; isCurrent: boolean; externalUrl?: string; displayOrder: number; createdAt: Date; updatedAt: Date; }
const schema = new Schema<IServiceLeadership>({ role: { type: String, required: true }, organization: { type: String, required: true }, type: { type: String, required: true }, description: String, startDate: Date, endDate: Date, isCurrent: { type: Boolean, default: false }, externalUrl: String, displayOrder: { type: Number, default: 0 } }, { timestamps: true });
schema.index({ type: 1 }); schema.index({ displayOrder: 1 });
export const ServiceLeadership = mongoose.model<IServiceLeadership>('ServiceLeadership', schema);
