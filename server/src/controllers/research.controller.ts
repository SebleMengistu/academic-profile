import { Request, Response, NextFunction } from 'express';
import { ResearchArea } from '../models/ResearchArea';
import { FundedResearch } from '../models/FundedResearch';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/audit';
import xss from 'xss';

export const getResearchAreas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ data: await ResearchArea.find().sort({ displayOrder: 1 }).lean() }); } catch (err) { next(err); }
};
export const adminGetResearchAreas = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ data: await ResearchArea.find().sort({ displayOrder: 1 }).lean() }); } catch (err) { next(err); }
};
export const adminCreateResearchArea = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, ...rest } = req.body;
    const slug = await generateUniqueSlug(name, ResearchArea);
    const doc = await ResearchArea.create({ name, slug, ...rest });
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'ResearchArea', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};
export const adminUpdateResearchArea = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await ResearchArea.findById(id);
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }
    const { name, ...rest } = req.body;
    const update: Record<string, unknown> = { ...rest };
    if (name && name !== existing.name) { update.name = name; update.slug = await generateUniqueSlug(name, ResearchArea, id); }
    else if (name) { update.name = name; }
    const doc = await ResearchArea.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'ResearchArea', entityId: id, req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};
export const adminDeleteResearchArea = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doc = await ResearchArea.findByIdAndDelete(id);
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'ResearchArea', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

export const getFundedResearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      FundedResearch.find({ contentStatus: 'PUBLISHED' }).populate('researchAreas', 'name slug').sort({ startDate: -1 }).skip(skip).limit(limit).lean(),
      FundedResearch.countDocuments({ contentStatus: 'PUBLISHED' }),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};
export const getFundedResearchBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await FundedResearch.findOne({ slug: req.params.slug as string, contentStatus: 'PUBLISHED' }).populate('researchAreas', 'name slug').lean();
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await FundedResearch.findByIdAndUpdate(doc._id, { $inc: { views: 1 } });
    res.json({ data: doc });
  } catch (err) { next(err); }
};
export const adminGetFundedResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = String(req.query.status);
    const [data, total] = await Promise.all([
      FundedResearch.find(filter).populate('researchAreas', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FundedResearch.countDocuments(filter),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};
export const adminCreateFundedResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, ...rest } = req.body;
    const slug = await generateUniqueSlug(title, FundedResearch);
    const doc = await FundedResearch.create({ title, slug, description: description ? xss(description) : undefined, ...rest });
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'FundedResearch', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};
export const adminUpdateFundedResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await FundedResearch.findById(id);
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }
    const { title, description, ...rest } = req.body;
    const update: Record<string, unknown> = { ...rest };
    if (title && title !== existing.title) { update.title = title; update.slug = await generateUniqueSlug(title, FundedResearch, id); }
    else if (title) { update.title = title; }
    if (description !== undefined) update.description = xss(description);
    const doc = await FundedResearch.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate('researchAreas', 'name slug');
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'FundedResearch', entityId: id, req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};
export const adminDeleteFundedResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doc = await FundedResearch.findByIdAndDelete(id);
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'FundedResearch', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
