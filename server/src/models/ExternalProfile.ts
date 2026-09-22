import mongoose, { Document, Schema } from 'mongoose';

export interface IExternalProfile extends Document {
  _id: mongoose.Types.ObjectId;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  displayOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IExternalProfile>(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'ORCID',
        'Google Scholar',
        'ResearchGate',
        'LinkedIn',
        'GitHub',
        'Scopus',
        'Web of Science',
        'Personal Website',
        'YouTube',
        'Twitter/X',
        'Other',
      ],
    },
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ displayOrder: 1 });

export const ExternalProfile = mongoose.model<IExternalProfile>('ExternalProfile', schema);
