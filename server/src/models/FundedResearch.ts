import mongoose, { Document, Schema } from 'mongoose';
import { ContentStatus } from '../types';

export type FundingType =
  | 'Grant'
  | 'Contract Research'
  | 'Industry Funding'
  | 'Government Funding'
  | 'University Funding'
  | 'Fellowship'
  | 'Scholarship'
  | 'Other';

export type ResearchStatus = 'ACTIVE' | 'COMPLETED' | 'PENDING' | 'CANCELLED';

export interface ITeamMember {
  name: string;
  role:
    | 'Principal Investigator'
    | 'Co-Investigator'
    | 'Researcher'
    | 'PhD Student'
    | 'Research Assistant'
    | 'Industry Partner'
    | 'External Collaborator';
  affiliation?: string;
}

export interface IFundedResearch extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  fundingType: FundingType;
  funder: string;
  fundingScheme?: string;
  grantNumber?: string;
  amount?: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
  status: ResearchStatus;
  principalInvestigator: string;
  teamMembers: ITeamMember[];
  researchAreas: mongoose.Types.ObjectId[];
  externalUrl?: string;
  featured: boolean;
  contentStatus: ContentStatus;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: [
        'Principal Investigator',
        'Co-Investigator',
        'Researcher',
        'PhD Student',
        'Research Assistant',
        'Industry Partner',
        'External Collaborator',
      ],
    },
    affiliation: { type: String, trim: true },
  },
  { _id: false }
);

const schema = new Schema<IFundedResearch>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    fundingType: {
      type: String,
      required: true,
      enum: [
        'Grant',
        'Contract Research',
        'Industry Funding',
        'Government Funding',
        'University Funding',
        'Fellowship',
        'Scholarship',
        'Other',
      ],
    },
    funder: { type: String, required: true, trim: true },
    fundingScheme: { type: String, trim: true },
    grantNumber: { type: String, trim: true },
    amount: { type: Number },
    currency: { type: String, trim: true, default: 'USD' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'PENDING', 'CANCELLED'],
      default: 'ACTIVE',
    },
    principalInvestigator: { type: String, required: true, trim: true },
    teamMembers: [teamMemberSchema],
    researchAreas: [{ type: Schema.Types.ObjectId, ref: 'ResearchArea' }],
    externalUrl: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    contentStatus: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'],
      default: 'DRAFT',
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ slug: 1 }, { unique: true });
schema.index({ status: 1 });
schema.index({ startDate: -1 });
schema.index({ title: 'text', description: 'text' });

export const FundedResearch = mongoose.model<IFundedResearch>('FundedResearch', schema);
