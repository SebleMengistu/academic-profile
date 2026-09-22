import { Request, Response, NextFunction } from 'express';
import { Publication } from '../models/Publication';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/audit';
import * as cloudinaryService from '../services/cloudinary';
import xss from 'xss';

// ── Public ────────────────────────────────────────────────────────────────────

export const getPublications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { q, year, type, area } = req.query;

    const filter: Record<string, unknown> = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    if (q) {
      filter.$text = { $search: String(q) };
    }
    if (year) {
      filter.year = parseInt(String(year), 10);
    }
    if (type) {
      filter.publicationType = String(type);
    }
    if (area) {
      filter.researchAreas = area;
    }

    const [data, total] = await Promise.all([
      Publication.find(filter)
        .populate('researchAreas', 'name slug')
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Publication.countDocuments(filter),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const getPublicationBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const publication = await Publication.findOne({
      slug: (req.params.slug as string),
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    })
      .populate('researchAreas', 'name slug')
      .lean();

    if (!publication) {
      res.status(404).json({ message: 'Publication not found' });
      return;
    }

    // Increment views
    await Publication.findByIdAndUpdate(publication._id, { $inc: { views: 1 } });

    res.json({ data: publication });
  } catch (err) {
    next(err);
  }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminGetPublications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { q, year, type, status } = req.query;

    const filter: Record<string, unknown> = {};

    if (q) filter.$text = { $search: String(q) };
    if (year) filter.year = parseInt(String(year), 10);
    if (type) filter.publicationType = String(type);
    if (status) filter.status = String(status);

    const [data, total] = await Promise.all([
      Publication.find(filter)
        .populate('researchAreas', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Publication.countDocuments(filter),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const adminGetPublicationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const publication = await Publication.findById((req.params.id as string))
      .populate('researchAreas', 'name slug')
      .lean();

    if (!publication) {
      res.status(404).json({ message: 'Not found' });
      return;
    }

    res.json({ data: publication });
  } catch (err) {
    next(err);
  }
};

export const adminCreatePublication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, abstract, ...rest } = req.body;
    const slug = await generateUniqueSlug(title, Publication);

    const data: Record<string, unknown> = {
      title,
      slug,
      abstract: abstract ? xss(abstract) : undefined,
      ...rest,
    };

    // Handle PDF upload
    if (req.file) {
      const result = await cloudinaryService.uploadFile(
        req.file.buffer,
        'publications',
        `${slug}.pdf`
      );
      data.pdfUrl = result.url;
      data.pdfPublicId = result.publicId;
    }

    const publication = await Publication.create(data);

    await createAuditLog({
      user: req.user,
      action: 'CREATE',
      entity: 'Publication',
      entityId: publication._id.toString(),
      req,
    });

    res.status(201).json({ data: publication });
  } catch (err) {
    next(err);
  }
};

export const adminUpdatePublication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const existing = await Publication.findById((req.params.id as string));
    if (!existing) {
      res.status(404).json({ message: 'Not found' });
      return;
    }

    const { title, abstract, ...rest } = req.body;
    const updateData: Record<string, unknown> = { ...rest };

    if (title && title !== existing.title) {
      updateData.title = title;
      updateData.slug = await generateUniqueSlug(title, Publication, (req.params.id as string));
    } else if (title) {
      updateData.title = title;
    }

    if (abstract !== undefined) {
      updateData.abstract = xss(abstract);
    }

    if (req.file) {
      if (existing.pdfPublicId) {
        await cloudinaryService.deleteRawFile(existing.pdfPublicId).catch(() => {});
      }
      const result = await cloudinaryService.uploadFile(
        req.file.buffer,
        'publications',
        `${existing.slug}.pdf`
      );
      updateData.pdfUrl = result.url;
      updateData.pdfPublicId = result.publicId;
    }

    const publication = await Publication.findByIdAndUpdate(
      (req.params.id as string),
      updateData,
      { new: true, runValidators: true }
    ).populate('researchAreas', 'name slug');

    await createAuditLog({
      user: req.user,
      action: 'UPDATE',
      entity: 'Publication',
      entityId: (req.params.id as string),
      req,
    });

    res.json({ data: publication });
  } catch (err) {
    next(err);
  }
};

export const adminDeletePublication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const publication = await Publication.findByIdAndDelete((req.params.id as string));
    if (!publication) {
      res.status(404).json({ message: 'Not found' });
      return;
    }

    if (publication.pdfPublicId) {
      await cloudinaryService.deleteRawFile(publication.pdfPublicId).catch(() => {});
    }

    await createAuditLog({
      user: req.user,
      action: 'DELETE',
      entity: 'Publication',
      entityId: (req.params.id as string),
      req,
    });

    res.json({ message: 'Publication deleted' });
  } catch (err) {
    next(err);
  }
};

export const adminPublishPublication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const publication = await Publication.findByIdAndUpdate(
      (req.params.id as string),
      { status: 'PUBLISHED' },
      { new: true }
    );
    if (!publication) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    await createAuditLog({ user: req.user, action: 'PUBLISH', entity: 'Publication', entityId: (req.params.id as string), req });
    res.json({ data: publication });
  } catch (err) {
    next(err);
  }
};

