import mongoose, { Document, Schema } from 'mongoose';

export interface ISeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  twitterHandle?: string;
  canonicalUrl?: string;
}

export interface ISettings extends Document {
  _id: mongoose.Types.ObjectId;
  siteName: string;
  siteUrl?: string;
  seo?: ISeoSettings;
  maintenanceMode: boolean;
  allowContactForm: boolean;
  analyticsEnabled: boolean;
  googleAnalyticsId?: string;
  footerText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ISettings>(
  {
    siteName: { type: String, default: 'Academic Profile' },
    siteUrl: { type: String },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
      ogImage: { type: String },
      twitterHandle: { type: String },
      canonicalUrl: { type: String },
    },
    maintenanceMode: { type: Boolean, default: false },
    allowContactForm: { type: Boolean, default: true },
    analyticsEnabled: { type: Boolean, default: true },
    googleAnalyticsId: { type: String },
    footerText: { type: String },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', schema);
