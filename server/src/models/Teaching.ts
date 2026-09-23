import mongoose, { Document, Schema } from 'mongoose';
export interface ITeaching extends Document { _id: mongoose.Types.ObjectId; courseName: string; courseCode?: string; institution: string; level: string; semester?: string; year?: number; description?: string; displayOrder: number; createdAt: Date; updatedAt: Date; }
const schema = new Schema<ITeaching>({ courseName: { type: String, required: true }, courseCode: String, institution: { type: String, required: true }, level: { type: String, default: 'Undergraduate' }, semester: String, year: Number, description: String, displayOrder: { type: Number, default: 0 } }, { timestamps: true });
schema.index({ displayOrder: 1 }); schema.index({ year: -1 });
export const Teaching = mongoose.model<ITeaching>('Teaching', schema);
