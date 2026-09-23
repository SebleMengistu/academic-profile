import { Request, Response, NextFunction } from 'express';
import { Profile } from '../models/Profile';
import { AcademicAppointment } from '../models/AcademicAppointment';
import { Education } from '../models/Education';
import { ExternalProfile } from '../models/ExternalProfile';
import { Membership } from '../models/Membership';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';
import * as cloudinaryService from '../services/cloudinary';

// ── Public ─────────────────────────────────────────────────────────────────────
export const getPublicProfile = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await Profile.findOne({ visibility: 'PUBLIC' }).lean();
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }
    res.json({ data: profile });
  } catch (err) { next(err); }
};
export const getPublicAppointments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ data: await AcademicAppointment.find().sort({ displayOrder: 1, startDate: -1 }).lean() }); } catch (err) { next(err); }
};
export const getPublicEducation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ data: await Education.find().sort({ displayOrder: 1, completionDate: -1 }).lean() }); } catch (err) { next(err); }
};
export const getPublicExternalProfiles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ data: await ExternalProfile.find({ active: true }).sort({ displayOrder: 1 }).lean() }); } catch (err) { next(err); }
};
export const getPublicMemberships = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ data: await Membership.find().sort({ displayOrder: 1 }).lean() }); } catch (err) { next(err); }
};

// ── Admin Profile ──────────────────────────────────────────────────────────────
export const adminGetProfile = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ data: await Profile.findOne().lean() || null }); } catch (err) { next(err); }
};

export const adminUpsertProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await Profile.findOne();
    let data = req.body;
    if (req.file) {
      const r = await cloudinaryService.uploadImage(req.file.buffer, 'profile', { width: 400, height: 400 });
      if (existing?.profilePhotoPublicId) await cloudinaryService.deleteFile(existing.profilePhotoPublicId).catch(() => {});
      data = { ...data, profilePhoto: r.url, profilePhotoPublicId: r.publicId };
    }
    const profile = existing
      ? await Profile.findByIdAndUpdate(existing._id, data, { new: true, runValidators: true })
      : await Profile.create(data);
    await createAuditLog({ user: req.user, action: existing ? 'UPDATE' : 'CREATE', entity: 'Profile', entityId: profile?._id?.toString(), req });
    res.json({ data: profile, message: 'Profile saved' });
  } catch (err) { next(err); }
};

// ── Generic CRUD helpers ───────────────────────────────────────────────────────
type MongooseModel = { find: Function; findById: Function; findByIdAndUpdate: Function; findByIdAndDelete: Function; create: Function };

const listSorted = (Model: MongooseModel, sort: Record<string,number>) =>
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json({ data: await (Model as any).find().sort(sort).lean() }); } catch (err) { next(err); }
  };

const createDoc = (Model: MongooseModel, entity: string) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const doc = await (Model as any).create(req.body);
      await createAuditLog({ user: req.user, action: 'CREATE', entity, entityId: doc._id.toString(), req });
      res.status(201).json({ data: doc });
    } catch (err) { next(err); }
  };

const updateDoc = (Model: MongooseModel, entity: string) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const doc = await (Model as any).findByIdAndUpdate(req.params.id as string, req.body, { new: true, runValidators: true });
      if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
      await createAuditLog({ user: req.user, action: 'UPDATE', entity, entityId: req.params.id as string, req });
      res.json({ data: doc });
    } catch (err) { next(err); }
  };

const deleteDoc = (Model: MongooseModel, entity: string) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const doc = await (Model as any).findByIdAndDelete(req.params.id as string);
      if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
      await createAuditLog({ user: req.user, action: 'DELETE', entity, entityId: req.params.id as string, req });
      res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
  };

// ── Appointments ───────────────────────────────────────────────────────────────
export const adminGetAppointments   = listSorted(AcademicAppointment as any, { displayOrder: 1, startDate: -1 });
export const adminCreateAppointment = createDoc(AcademicAppointment as any, 'AcademicAppointment');
export const adminUpdateAppointment = updateDoc(AcademicAppointment as any, 'AcademicAppointment');
export const adminDeleteAppointment = deleteDoc(AcademicAppointment as any, 'AcademicAppointment');

// ── Education ──────────────────────────────────────────────────────────────────
export const adminGetEducation   = listSorted(Education as any, { displayOrder: 1, completionDate: -1 });
export const adminCreateEducation = createDoc(Education as any, 'Education');
export const adminUpdateEducation = updateDoc(Education as any, 'Education');
export const adminDeleteEducation = deleteDoc(Education as any, 'Education');

// ── External Profiles ──────────────────────────────────────────────────────────
export const adminGetExternalProfiles    = listSorted(ExternalProfile as any, { displayOrder: 1 });
export const adminCreateExternalProfile  = createDoc(ExternalProfile as any, 'ExternalProfile');
export const adminUpdateExternalProfile  = updateDoc(ExternalProfile as any, 'ExternalProfile');
export const adminDeleteExternalProfile  = deleteDoc(ExternalProfile as any, 'ExternalProfile');
