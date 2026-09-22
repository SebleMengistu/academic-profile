import mongoose, { Document, Schema } from 'mongoose';
import { AnalyticsEventType } from '../types';

export interface IAnalyticsEvent extends Document {
  _id: mongoose.Types.ObjectId;
  type: AnalyticsEventType;
  page?: string;
  entityId?: string;
  referrer?: string;
  device?: string;
  browser?: string;
  country?: string;
  sessionId?: string;
  createdAt: Date;
}

const schema = new Schema<IAnalyticsEvent>(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'PROFILE_VIEW',
        'PUBLICATION_VIEW',
        'RESEARCH_VIEW',
        'MEDIA_VIEW',
        'CV_DOWNLOAD',
        'EXTERNAL_LINK_CLICK',
        'CONTACT_SUBMISSION',
      ],
    },
    page: { type: String },
    entityId: { type: String },
    referrer: { type: String },
    device: { type: String },
    browser: { type: String },
    country: { type: String },
    sessionId: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

schema.index({ type: 1 });
schema.index({ createdAt: -1 });
schema.index({ entityId: 1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', schema);
