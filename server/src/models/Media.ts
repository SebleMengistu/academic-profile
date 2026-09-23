import mongoose, { Document, Schema } from 'mongoose';
export interface IMedia extends Document { _id: mongoose.Types.ObjectId; title: string; slug: string; type: string; description?: string; thumbnailUrl?: string; thumbnailPublicId?: string; url?: string; date?: Date; caption?: string; credit?: string; visibility: string; views: number; createdAt: Date; updatedAt: Date; }
const schema = new Schema<IMedia>({ title: { type: String, required: true }, slug: { type: String, required: true, unique: true, lowercase: true }, type: { type: String, required: true }, description: String, thumbnailUrl: String, thumbnailPublicId: String, url: String, date: Date, caption: String, credit: String, visibility: { type: String, enum: ['PUBLIC','PRIVATE'], default: 'PUBLIC' }, views: { type: Number, default: 0 } }, { timestamps: true });
schema.index({ slug: 1 }, { unique: true }); schema.index({ type: 1 }); schema.index({ date: -1 });
schema.index({ title: 'text', description: 'text' });
export const Media = mongoose.model<IMedia>('Media', schema);
