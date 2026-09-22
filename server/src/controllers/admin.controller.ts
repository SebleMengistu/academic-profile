import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Publication } from '../models/Publication';
import { FundedResearch } from '../models/FundedResearch';
import { Award } from '../models/Award';
import { Teaching } from '../models/Teaching';
import { Media } from '../models/Media';
import { ContactMessage } from '../models/ContactMessage';
import { AuditLog } from '../models/AuditLog';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { Settings } from '../models/Settings';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export const getDashboardStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalPublications,
      fundedProjects,
      awards,
      teachingRecords,
      mediaItems,
      newMessages,
      totalUsers,
    ] = await Promise.all([
      Publication.countDocuments({ status: 'PUBLISHED' }),
      FundedResearch.countDocuments(),
      Award.countDocuments(),
      Teaching.countDocuments(),
      Media.countDocuments(),
      ContactMessage.countDocuments({ status: 'New' }),
      User.countDocuments(),
    ]);

    // Publications by year (last 10 years)
    const publicationsByYear = await Publication.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 10 },
    ]);

    // Publication types breakdown
    const publicationTypes = await Publication.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$publicationType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent audit logs
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      data: {
        stats: {
          totalPublications,
          fundedProjects,
          awards,
          teachingRecords,
          mediaItems,
          newMessages,
          totalUsers,
        },
        charts: {
          publicationsByYear,
          publicationTypes,
        },
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'User', entityId: user._id.toString(), req });
    res.status(201).json({ data: user });
  } catch (err) { next(err); }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate((req.params.id as string), rest, { new: true });
    if (!user) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'User', entityId: (req.params.id as string), req });
    res.json({ data: user });
  } catch (err) { next(err); }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.userId === (req.params.id as string)) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }
    const user = await User.findByIdAndDelete((req.params.id as string));
    if (!user) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'User', entityId: (req.params.id as string), req });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

// ── Audit Logs ────────────────────────────────────────────────────────────────

export const getAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { entity, action } = req.query;

    const filter: Record<string, unknown> = {};
    if (entity) filter.entity = String(entity);
    if (action) filter.action = String(action);

    const [data, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const getSettings = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await Settings.findOne().lean();
    res.json({ data: settings || {} });
  } catch (err) { next(err); }
};

export const updateSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const existing = await Settings.findOne();
    const settings = existing
      ? await Settings.findByIdAndUpdate(existing._id, req.body, { new: true, upsert: true })
      : await Settings.create(req.body);

    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Settings', req });
    res.json({ data: settings });
  } catch (err) { next(err); }
};

// ── Search ────────────────────────────────────────────────────────────────────

export const search = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = String(req.query.q || '');
    if (!q) {
      res.json({ data: { publications: [], research: [], media: [] } });
      return;
    }

    const textFilter = { $text: { $search: q } };
    const [publications, research, media] = await Promise.all([
      Publication.find({ ...textFilter, status: 'PUBLISHED' }).limit(5).lean(),
      FundedResearch.find({ ...textFilter, contentStatus: 'PUBLISHED' }).limit(5).lean(),
      Media.find({ ...textFilter, visibility: 'PUBLIC' }).limit(5).lean(),
    ]);

    res.json({ data: { publications, research, media } });
  } catch (err) { next(err); }
};

