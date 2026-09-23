import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Publication } from '../models/Publication';
import { FundedResearch } from '../models/FundedResearch';
import { Award } from '../models/Award';
import { Teaching } from '../models/Teaching';
import { Media } from '../models/Media';
import { ContactMessage } from '../models/ContactMessage';
import { AuditLog } from '../models/AuditLog';
import { Settings } from '../models/Settings';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [pubs, funded, awards, teaching, media, messages, users, recentActivity, byYear, byType] = await Promise.all([
      Publication.countDocuments({ status: 'PUBLISHED' }),
      FundedResearch.countDocuments({}),
      Award.countDocuments({}),
      Teaching.countDocuments({}),
      Media.countDocuments({}),
      ContactMessage.countDocuments({ status: 'New' }),
      User.countDocuments({}),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
      Publication.aggregate([
        { $match: { status: 'PUBLISHED' } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 10 },
      ]),
      Publication.aggregate([
        { $match: { status: 'PUBLISHED' } },
        { $group: { _id: '$publicationType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      data: {
        stats: {
          totalPublications: pubs,
          fundedProjects:    funded,
          awards:            awards,
          teachingRecords:   teaching,
          mediaItems:        media,
          newMessages:       messages,
          totalUsers:        users,
        },
        charts: {
          publicationsByYear: byYear as { _id: number; count: number }[],
          publicationTypes:   byType as { _id: string; count: number }[],
        },
        recentActivity: recentActivity,
      },
    });
  } catch (err) { next(err); }
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments({}),
    ]);
    const users = data.map((u) => ({
      id: u._id.toString(),
      firstName: u.firstName,
      lastName:  u.lastName,
      email:     u.email,
      role:      u.role,
      isActive:  u.isActive,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
    }));
    res.json(buildPaginatedResponse(users, total, page, limit));
  } catch (err) { next(err); }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const user = await User.create({ firstName, lastName, email: String(email).toLowerCase(), password, role: role ?? 'EDITOR' });
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'User', entityId: user._id.toString(), req });
    res.status(201).json({ data: { id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt } });
  } catch (err) { next(err); }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { firstName, lastName, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(id, { firstName, lastName, role, isActive }, { new: true, runValidators: true });
    if (!user) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'User', entityId: id, req });
    res.json({ data: { id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isActive: user.isActive, lastLogin: user.lastLogin } });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (req.user?.userId === id) { res.status(400).json({ message: 'Cannot delete your own account' }); return; }
    const user = await User.findByIdAndDelete(id);
    if (!user) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'User', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.entity) filter.entity = String(req.query.entity);
    if (req.query.action) filter.action = String(req.query.action);
    const [data, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const getSettings = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await Settings.findOne().lean();
    res.json({ data: settings ?? {} });
  } catch (err) { next(err); }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const b = req.body;
    const settings = await Settings.findOneAndUpdate({}, {
      siteName:          b.siteName,
      siteUrl:           b.siteUrl,
      seo:               b.seo,
      maintenanceMode:   b.maintenanceMode,
      allowContactForm:  b.allowContactForm,
      analyticsEnabled:  b.analyticsEnabled,
      googleAnalyticsId: b.googleAnalyticsId,
      footerText:        b.footerText,
    }, { new: true, runValidators: true, upsert: true });
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Settings', req });
    res.json({ data: settings });
  } catch (err) { next(err); }
};

// ── Search ────────────────────────────────────────────────────────────────────
export const search = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) { res.json({ data: { publications: [], research: [], media: [] } }); return; }
    const rx = new RegExp(escapeRegex(q), 'i');

    const [pubs, research, media] = await Promise.all([
      Publication.find({ status: 'PUBLISHED', title: rx }).select('title slug year publicationType status').limit(5).lean(),
      FundedResearch.find({ contentStatus: 'PUBLISHED', title: rx }).select('title slug status contentStatus').limit(5).lean(),
      Media.find({ visibility: 'PUBLIC', title: rx }).select('title slug type').limit(5).lean(),
    ]);

    res.json({ data: { publications: pubs, research, media } });
  } catch (err) { next(err); }
};