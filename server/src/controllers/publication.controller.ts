import { Request, Response, NextFunction } from 'express';
import { Publication } from '../models/Publication';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/audit';
import * as cloudinaryService from '../services/cloudinary';
import xss from 'xss';

export const getPublications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { q, year, type, area } = req.query;
    const filter: Record<string, unknown> = { status: 'PUBLISHED', visibility: 'PUBLIC' };
    if (q)    filter.$text = { $search: String(q) };
    if (year) filter.year = parseInt(String(year), 10);
    if (type) filter.publicationType = String(type);
    if (area) filter.researchAreas = area;
    const [data, total] = await Promise.all([
      Publication.find(filter).populate('researchAreas', 'name slug').sort({ year: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Publication.countDocuments(filter),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

export const getPublicationBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pub = await Publication.findOne({ slug: req.params.slug as string, status: 'PUBLISHED', visibility: 'PUBLIC' }).populate('researchAreas', 'name slug').lean();
    if (!pub) { res.status(404).json({ message: 'Not found' }); return; }
    await Publication.findByIdAndUpdate(pub._id, { $inc: { views: 1 } });
    res.json({ data: pub });
  } catch (err) { next(err); }
};

export const adminGetPublications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { q, year, type, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (q)      filter.$text = { $search: String(q) };
    if (year)   filter.year = parseInt(String(year), 10);
    if (type)   filter.publicationType = String(type);
    if (status) filter.status = String(status);
    const [data, total] = await Promise.all([
      Publication.find(filter).populate('researchAreas', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Publication.countDocuments(filter),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

export const adminGetPublicationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pub = await Publication.findById(req.params.id as string).populate('researchAreas', 'name slug').lean();
    if (!pub) { res.status(404).json({ message: 'Not found' }); return; }
    res.json({ data: pub });
  } catch (err) { next(err); }
};

export const adminCreatePublication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, abstract, ...rest } = req.body;
    const slug = await generateUniqueSlug(title, Publication);
    const data: Record<string, unknown> = { title, slug, abstract: abstract ? xss(abstract) : undefined, ...rest };
    if (req.file) {
      const r = await cloudinaryService.uploadFile(req.file.buffer, 'publications', `${slug}.pdf`);
      data.pdfUrl = r.url; data.pdfPublicId = r.publicId;
    }
    const pub = await Publication.create(data);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'Publication', entityId: pub._id.toString(), req });
    res.status(201).json({ data: pub });
  } catch (err) { next(err); }
};

export const adminUpdatePublication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await Publication.findById(id);
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }
    const { title, abstract, ...rest } = req.body;
    const update: Record<string, unknown> = { ...rest };
    if (title && title !== existing.title) { update.title = title; update.slug = await generateUniqueSlug(title, Publication, id); }
    else if (title) { update.title = title; }
    if (abstract !== undefined) update.abstract = xss(abstract);
    if (req.file) {
      if (existing.pdfPublicId) await cloudinaryService.deleteRawFile(existing.pdfPublicId).catch(() => {});
      const r = await cloudinaryService.uploadFile(req.file.buffer, 'publications', `${existing.slug}.pdf`);
      update.pdfUrl = r.url; update.pdfPublicId = r.publicId;
    }
    const pub = await Publication.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate('researchAreas', 'name slug');
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Publication', entityId: id, req });
    res.json({ data: pub });
  } catch (err) { next(err); }
};

export const adminDeletePublication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const pub = await Publication.findByIdAndDelete(id);
    if (!pub) { res.status(404).json({ message: 'Not found' }); return; }
    if (pub.pdfPublicId) await cloudinaryService.deleteRawFile(pub.pdfPublicId).catch(() => {});
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'Publication', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

export const adminPublishPublication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const pub = await Publication.findByIdAndUpdate(id, { status: 'PUBLISHED' }, { new: true });
    if (!pub) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'PUBLISH', entity: 'Publication', entityId: id, req });
    res.json({ data: pub });
  } catch (err) { next(err); }
};
