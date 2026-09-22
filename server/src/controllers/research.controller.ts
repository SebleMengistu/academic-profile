import { Request, Response, NextFunction } from 'express';
import { ResearchArea } from '../models/ResearchArea';
import { FundedResearch } from '../models/FundedResearch';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/audit';
import xss from 'xss';

// ── Research Areas ────────────────────────────────────────────────────────────

export const getResearchAreas = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await ResearchArea.find().sort({ displayOrder: 1 }).lean();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const adminGetResearchAreas = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await ResearchArea.find().sort({ displayOrder: 1 }).lean();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const adminCreateResearchArea = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, ...rest } = req.body;
    const slug = await generateUniqueSlug(name, ResearchArea);
    const doc = await ResearchArea.create({ name, slug, ...rest });
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'ResearchArea', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateResearchArea = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, ...rest } = req.body;
    const existing = await ResearchArea.findById((req.params.id as string));
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }

    const update: Record<string, unknown> = { ...rest };
    if (name && name !== existing.name) {
      update.name = name;
      update.slug = await generateUniqueSlug(name, ResearchArea, (req.params.id as string));
    } else if (name) {
      update.name = name;
    }

    const doc = await ResearchArea.findByIdAndUpdate((req.params.id as string), update, { new: true, runValidators: true });
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'ResearchArea', entityId: (req.params.id as string), req });
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminDeleteResearchArea = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await ResearchArea.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'ResearchArea', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Funded Research ───────────────────────────────────────────────────────────

export const getFundedResearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = { contentStatus: 'PUBLISHED' };

    const [data, total] = await Promise.all([
      FundedResearch.find(filter)
        .populate('researchAreas', 'name slug')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FundedResearch.countDocuments(filter),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const getFundedResearchBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await FundedResearch.findOne({
      slug: (req.params.slug as string),
      contentStatus: 'PUBLISHED',
    })
      .populate('researchAreas', 'name slug')
      .lean();

    if (!doc) {
      res.status(404).json({ message: 'Not found' });
      return;
    }

    await FundedResearch.findByIdAndUpdate(doc._id, { $inc: { views: 1 } });
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminGetFundedResearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = String(status);

    const [data, total] = await Promise.all([
      FundedResearch.find(filter)
        .populate('researchAreas', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FundedResearch.countDocuments(filter),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const adminCreateFundedResearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, ...rest } = req.body;
    const slug = await generateUniqueSlug(title, FundedResearch);
    const doc = await FundedResearch.create({
      title,
      slug,
      description: description ? xss(description) : undefined,
      ...rest,
    });
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'FundedResearch', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateFundedResearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const existing = await FundedResearch.findById((req.params.id as string));
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }

    const { title, description, ...rest } = req.body;
    const update: Record<string, unknown> = { ...rest };
    if (title && title !== existing.title) {
      update.title = title;
      update.slug = await generateUniqueSlug(title, FundedResearch, (req.params.id as string));
    } else if (title) {
      update.title = title;
    }
    if (description !== undefined) update.description = xss(description);

    const doc = await FundedResearch.findByIdAndUpdate((req.params.id as string), update, { new: true, runValidators: true }).populate('researchAreas', 'name slug');
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'FundedResearch', entityId: (req.params.id as string), req });
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminDeleteFundedResearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await FundedResearch.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'FundedResearch', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

