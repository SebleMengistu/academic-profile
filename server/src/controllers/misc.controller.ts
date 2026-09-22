import { Request, Response, NextFunction } from 'express';
import { ServiceLeadership } from '../models/ServiceLeadership';
import { Award } from '../models/Award';
import { Membership } from '../models/Membership';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';

// ── Service & Leadership ──────────────────────────────────────────────────────

export const getServiceLeadership = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await ServiceLeadership.find().sort({ displayOrder: 1, startDate: -1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminGetServiceLeadership = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await ServiceLeadership.find().sort({ displayOrder: 1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminCreateServiceLeadership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await ServiceLeadership.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'ServiceLeadership', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};

export const adminUpdateServiceLeadership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await ServiceLeadership.findByIdAndUpdate((req.params.id as string), req.body, { new: true, runValidators: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'ServiceLeadership', entityId: (req.params.id as string), req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminDeleteServiceLeadership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await ServiceLeadership.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'ServiceLeadership', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── Awards ────────────────────────────────────────────────────────────────────

export const getAwards = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Award.find().sort({ date: -1, displayOrder: 1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminGetAwards = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Award.find().sort({ date: -1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminCreateAward = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Award.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'Award', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};

export const adminUpdateAward = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Award.findByIdAndUpdate((req.params.id as string), req.body, { new: true, runValidators: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Award', entityId: (req.params.id as string), req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminDeleteAward = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Award.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'Award', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── Memberships ───────────────────────────────────────────────────────────────

export const adminGetMemberships = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Membership.find().sort({ displayOrder: 1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminCreateMembership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Membership.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'Membership', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};

export const adminUpdateMembership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Membership.findByIdAndUpdate((req.params.id as string), req.body, { new: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Membership', entityId: (req.params.id as string), req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminDeleteMembership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Membership.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'Membership', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

