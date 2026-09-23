import mongoose, { Document, Schema } from 'mongoose';
export interface IFundedResearch extends Document {
  _id: mongoose.Types.ObjectId;
  title: string; slug: string; description?: string; fundingType: string; funder: string;
  fundingScheme?: string; grantNumber?: string; amount?: number; currency?: string;
  startDate: Date; endDate?: Date; status: string; principalInvestigator: string;
  teamMembers: { name: string; role: string; affiliation?: string }[];
  researchAreas: mongoose.Types.ObjectId[];
  externalUrl?: string; featured: boolean; contentStatus: string; views: number;
  createdAt: Date; updatedAt: Date;
}
const teamSchema = new Schema({ name: { type: String, required: true }, role: { type: String, required: true }, affiliation: String }, { _id: false });
const schema = new Schema<IFundedResearch>({
  title: { type: String, required: true }, slug: { type: String, required: true, unique: true, lowercase: true },
  description: String, fundingType: { type: String, required: true }, funder: { type: String, required: true },
  fundingScheme: String, grantNumber: String, amount: Number, currency: { type: String, default: 'USD' },
  startDate: { type: Date, required: true }, endDate: Date,
  status: { type: String, enum: ['ACTIVE','COMPLETED','PENDING','CANCELLED'], default: 'ACTIVE' },
  principalInvestigator: { type: String, required: true }, teamMembers: [teamSchema],
  researchAreas: [{ type: Schema.Types.ObjectId, ref: 'ResearchArea' }],
  externalUrl: String, featured: { type: Boolean, default: false },
  contentStatus: { type: String, enum: ['DRAFT','PUBLISHED','ARCHIVED','SCHEDULED'], default: 'DRAFT' },
  views: { type: Number, default: 0 },
}, { timestamps: true });
schema.index({ slug: 1 }, { unique: true }); schema.index({ status: 1 }); schema.index({ startDate: -1 });
schema.index({ title: 'text', description: 'text' });
export const FundedResearch = mongoose.model<IFundedResearch>('FundedResearch', schema);
