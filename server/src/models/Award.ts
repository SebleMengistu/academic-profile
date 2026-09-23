import mongoose, { Document, Schema } from 'mongoose';
export interface IAward extends Document { _id: mongoose.Types.ObjectId; name: string; organization: string; date?: Date; category?: string; description?: string; certificateUrl?: string; certificatePublicId?: string; externalUrl?: string; displayOrder: number; createdAt: Date; updatedAt: Date; }
const schema = new Schema<IAward>({ name: { type: String, required: true }, organization: { type: String, required: true }, date: Date, category: String, description: String, certificateUrl: String, certificatePublicId: String, externalUrl: String, displayOrder: { type: Number, default: 0 } }, { timestamps: true });
schema.index({ date: -1 }); schema.index({ displayOrder: 1 });
export const Award = mongoose.model<IAward>('Award', schema);
