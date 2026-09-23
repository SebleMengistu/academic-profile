import mongoose, { Document, Schema } from 'mongoose';
export interface ISupervision extends Document { _id: mongoose.Types.ObjectId; studentName: string; degree: string; researchTopic: string; role: string; startDate?: Date; completionDate?: Date; status: string; coSupervisors?: string[]; description?: string; institution?: string; createdAt: Date; updatedAt: Date; }
const schema = new Schema<ISupervision>({ studentName: { type: String, required: true }, degree: { type: String, required: true }, researchTopic: { type: String, required: true }, role: { type: String, required: true }, startDate: Date, completionDate: Date, status: { type: String, enum: ['Current','Completed','Withdrawn'], default: 'Current' }, coSupervisors: [String], description: String, institution: String }, { timestamps: true });
schema.index({ status: 1 }); schema.index({ startDate: -1 });
export const Supervision = mongoose.model<ISupervision>('Supervision', schema);
