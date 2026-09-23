import mongoose, { Document, Schema } from 'mongoose';
export interface IPublication extends Document {
  _id: mongoose.Types.ObjectId;
  title: string; slug: string; abstract?: string; publicationType: string;
  authors: { name: string; affiliation?: string; orcid?: string; isCorresponding?: boolean; order: number }[];
  journal?: string; conference?: string; publisher?: string;
  volume?: string; issue?: string; pages?: string; year: number; publicationDate?: Date;
  doi?: string; isbn?: string; issn?: string; keywords: string[]; citation?: string;
  pdfUrl?: string; pdfPublicId?: string; externalUrl?: string;
  researchAreas: mongoose.Types.ObjectId[];
  featured: boolean; status: string; visibility: string; views: number;
  createdAt: Date; updatedAt: Date;
}
const authorSchema = new Schema({ name: { type: String, required: true }, affiliation: String, orcid: String, isCorresponding: { type: Boolean, default: false }, order: { type: Number, default: 0 } }, { _id: false });
const schema = new Schema<IPublication>({
  title: { type: String, required: true }, slug: { type: String, required: true, unique: true, lowercase: true },
  abstract: String, publicationType: { type: String, required: true },
  authors: [authorSchema], journal: String, conference: String, publisher: String,
  volume: String, issue: String, pages: String, year: { type: Number, required: true }, publicationDate: Date,
  doi: String, isbn: String, issn: String, keywords: [String], citation: String,
  pdfUrl: String, pdfPublicId: String, externalUrl: String,
  researchAreas: [{ type: Schema.Types.ObjectId, ref: 'ResearchArea' }],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['DRAFT','PUBLISHED','ARCHIVED','SCHEDULED'], default: 'DRAFT' },
  visibility: { type: String, enum: ['PUBLIC','PRIVATE'], default: 'PUBLIC' },
  views: { type: Number, default: 0 },
}, { timestamps: true });
schema.index({ slug: 1 }, { unique: true });
schema.index({ year: -1 }); schema.index({ publicationType: 1 }); schema.index({ status: 1 }); schema.index({ featured: 1 });
schema.index({ title: 'text', abstract: 'text', keywords: 'text' });
export const Publication = mongoose.model<IPublication>('Publication', schema);
