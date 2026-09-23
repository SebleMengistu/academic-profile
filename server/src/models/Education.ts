import mongoose, { Document, Schema } from 'mongoose';
export interface IEducation extends Document {
  _id: mongoose.Types.ObjectId;
  degree: string; field: string; institution: string; location?: string; country?: string;
  startDate?: Date; completionDate?: Date; thesisTitle?: string; thesisUrl?: string;
  description?: string; displayOrder: number; createdAt: Date; updatedAt: Date;
}
const schema = new Schema<IEducation>({
  degree: { type: String, required: true }, field: { type: String, required: true },
  institution: { type: String, required: true }, location: String, country: String,
  startDate: Date, completionDate: Date, thesisTitle: String, thesisUrl: String,
  description: String, displayOrder: { type: Number, default: 0 },
}, { timestamps: true });
schema.index({ displayOrder: 1 });
export const Education = mongoose.model<IEducation>('Education', schema);
