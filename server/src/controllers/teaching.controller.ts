import { Request, Response, NextFunction } from 'express';
import { Teaching } from '../models/Teaching';
import { Supervision } from '../models/Supervision';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';

// ── Teaching ──────────────────────────────────────────────────────────────────

export const getTeaching = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Teaching.find().sort({ displayOrder: 1, year: -1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminGetTeaching = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Teaching.find().sort({ displayOrder: 1, year: -1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminCreateTeaching = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Teaching.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'Teaching', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};

export const adminUpdateTeaching = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Teaching.findByIdAndUpdate((req.params.id as string), req.body, { new: true, runValidators: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Teaching', entityId: (req.params.id as string), req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminDeleteTeaching = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Teaching.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'Teaching', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── Supervision ───────────────────────────────────────────────────────────────

export const getSupervision = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Supervision.find().sort({ startDate: -1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminGetSupervision = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Supervision.find().sort({ startDate: -1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminCreateSupervision = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Supervision.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'Supervision', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};

export const adminUpdateSupervision = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Supervision.findByIdAndUpdate((req.params.id as string), req.body, { new: true, runValidators: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Supervision', entityId: (req.params.id as string), req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminDeleteSupervision = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Supervision.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'Supervision', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

