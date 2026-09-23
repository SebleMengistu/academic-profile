import mongoose, { Document, Schema } from 'mongoose';
export interface IAcademicAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string; institution: string; faculty?: string; department?: string; location?: string;
  startDate: Date; endDate?: Date; isCurrent: boolean; description?: string; displayOrder: number;
  createdAt: Date; updatedAt: Date;
}
const schema = new Schema<IAcademicAppointment>({
  title: { type: String, required: true }, institution: { type: String, required: true },
  faculty: String, department: String, location: String,
  startDate: { type: Date, required: true }, endDate: Date, isCurrent: { type: Boolean, default: false },
  description: String, displayOrder: { type: Number, default: 0 },
}, { timestamps: true });
schema.index({ displayOrder: 1 });
export const AcademicAppointment = mongoose.model<IAcademicAppointment>('AcademicAppointment', schema);
