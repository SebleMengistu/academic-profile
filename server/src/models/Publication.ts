import mongoose, { Document, Schema } from 'mongoose';
import { ContentStatus } from '../types';

export type PublicationType =
  | 'Journal Article'
  | 'Conference Paper'
  | 'Book'
  | 'Book Chapter'
  | 'Technical Report'
  | 'Patent'
  | 'Dataset'
  | 'Software'
  | 'Thesis'
  | 'Poster'
  | 'Other';

export interface IPublicationAuthor {
  name: string;
  affiliation?: string;
  orcid?: string;
  isCorresponding?: boolean;
  order: number;
}

export interface IPublication extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  abstract?: string;
  publicationType: PublicationType;
  authors: IPublicationAuthor[];
  journal?: string;
  conference?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year: number;
  publicationDate?: Date;
  doi?: string;
  isbn?: string;
  issn?: string;
  keywords: string[];
  citation?: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  externalUrl?: string;
  researchAreas: mongoose.Types.ObjectId[];
  featured: boolean;
  status: ContentStatus;
  visibility: 'PUBLIC' | 'PRIVATE';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IPublicationAuthor>(
  {
    name: { type: String, required: true, trim: true },
    affiliation: { type: String, trim: true },
    orcid: { type: String, trim: true },
    isCorresponding: { type: Boolean, default: false },
    order: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const schema = new Schema<IPublication>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    abstract: { type: String },
    publicationType: {
      type: String,
      required: true,
      enum: [
        'Journal Article',
        'Conference Paper',
        'Book',
        'Book Chapter',
        'Technical Report',
        'Patent',
        'Dataset',
        'Software',
        'Thesis',
        'Poster',
        'Other',
      ],
    },
    authors: [authorSchema],
    journal: { type: String, trim: true },
    conference: { type: String, trim: true },
    publisher: { type: String, trim: true },
    volume: { type: String, trim: true },
    issue: { type: String, trim: true },
    pages: { type: String, trim: true },
    year: { type: Number, required: true },
    publicationDate: { type: Date },
    doi: { type: String, trim: true },
    isbn: { type: String, trim: true },
    issn: { type: String, trim: true },
    keywords: [{ type: String, trim: true, lowercase: true }],
    citation: { type: String },
    pdfUrl: { type: String },
    pdfPublicId: { type: String },
    externalUrl: { type: String, trim: true },
    researchAreas: [{ type: Schema.Types.ObjectId, ref: 'ResearchArea' }],
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'],
      default: 'DRAFT',
    },
    visibility: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ slug: 1 }, { unique: true });
schema.index({ year: -1 });
schema.index({ publicationType: 1 });
schema.index({ status: 1 });
schema.index({ featured: 1 });
schema.index({ researchAreas: 1 });
schema.index({ title: 'text', abstract: 'text', keywords: 'text' });

export const Publication = mongoose.model<IPublication>('Publication', schema);
