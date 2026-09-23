import { Request, Response, NextFunction } from 'express';
import { Media } from '../models/Media';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/audit';
import * as cloudinaryService from '../services/cloudinary';

export const getMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = { visibility: 'PUBLIC' };
    if (req.query.type) filter.type = String(req.query.type);
    const [data, total] = await Promise.all([Media.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(), Media.countDocuments(filter)]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};
export const getMediaBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Media.findOne({ slug: req.params.slug as string, visibility: 'PUBLIC' }).lean();
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await Media.findByIdAndUpdate(doc._id, { $inc: { views: 1 } });
    res.json({ data: doc });
  } catch (err) { next(err); }
};
export const adminGetMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.type) filter.type = String(req.query.type);
    const [data, total] = await Promise.all([Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Media.countDocuments(filter)]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};
export const adminCreateMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, ...rest } = req.body;
    const slug = await generateUniqueSlug(title, Media);
    const data: Record<string, unknown> = { title, slug, ...rest };
    if (req.file) { const r = await cloudinaryService.uploadImage(req.file.buffer, 'media', { width: 800 }); data.thumbnailUrl = r.url; data.thumbnailPublicId = r.publicId; }
    const doc = await Media.create(data);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'Media', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};
export const adminUpdateMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await Media.findById(id);
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }
    const update: Record<string, unknown> = { ...req.body };
    if (req.file) {
      if (existing.thumbnailPublicId) await cloudinaryService.deleteFile(existing.thumbnailPublicId).catch(() => {});
      const r = await cloudinaryService.uploadImage(req.file.buffer, 'media', { width: 800 });
      update.thumbnailUrl = r.url; update.thumbnailPublicId = r.publicId;
    }
    const doc = await Media.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Media', entityId: id, req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};
export const adminDeleteMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doc = await Media.findByIdAndDelete(id);
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    if (doc.thumbnailPublicId) await cloudinaryService.deleteFile(doc.thumbnailPublicId).catch(() => {});
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'Media', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
