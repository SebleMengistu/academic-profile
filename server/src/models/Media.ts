import mongoose, { Document, Schema } from 'mongoose';

export type MediaType =
  | 'Video'
  | 'Image'
  | 'Interview'
  | 'Podcast'
  | 'News'
  | 'Presentation'
  | 'Other';

export interface IMedia extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  type: MediaType;
  description?: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  url?: string;
  date?: Date;
  caption?: string;
  credit?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMedia>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['Video', 'Image', 'Interview', 'Podcast', 'News', 'Presentation', 'Other'],
    },
    description: { type: String },
    thumbnailUrl: { type: String },
    thumbnailPublicId: { type: String },
    url: { type: String, trim: true },
    date: { type: Date },
    caption: { type: String },
    credit: { type: String, trim: true },
    visibility: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ slug: 1 }, { unique: true });
schema.index({ type: 1 });
schema.index({ date: -1 });
schema.index({ title: 'text', description: 'text' });

export const Media = mongoose.model<IMedia>('Media', schema);
