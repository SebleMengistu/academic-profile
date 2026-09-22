import { Request, Response, NextFunction } from 'express';
import { Profile } from '../models/Profile';
import { AcademicAppointment } from '../models/AcademicAppointment';
import { Education } from '../models/Education';
import { ExternalProfile } from '../models/ExternalProfile';
import { Membership } from '../models/Membership';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';
import * as cloudinaryService from '../services/cloudinary';

// ── Public ────────────────────────────────────────────────────────────────────

export const getPublicProfile = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await Profile.findOne({ visibility: 'PUBLIC' }).lean();
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};

export const getPublicAppointments = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await AcademicAppointment.find()
      .sort({ displayOrder: 1, startDate: -1 })
      .lean();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getPublicEducation = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await Education.find()
      .sort({ displayOrder: 1, completionDate: -1 })
      .lean();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getPublicExternalProfiles = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await ExternalProfile.find({ active: true })
      .sort({ displayOrder: 1 })
      .lean();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const getPublicMemberships = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await Membership.find().sort({ displayOrder: 1 }).lean();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminGetProfile = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await Profile.findOne().lean();
    res.json({ data: profile || null });
  } catch (err) {
    next(err);
  }
};

export const adminUpsertProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const existing = await Profile.findOne();

    let profileData = req.body;

    // Handle photo upload
    if (req.file) {
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'profile', {
        width: 400,
        height: 400,
      });
      if (existing?.profilePhotoPublicId) {
        await cloudinaryService.deleteFile(existing.profilePhotoPublicId).catch(() => {});
      }
      profileData = {
        ...profileData,
        profilePhoto: result.url,
        profilePhotoPublicId: result.publicId,
      };
    }

    const profile = existing
      ? await Profile.findByIdAndUpdate(existing._id, profileData, { new: true, runValidators: true })
      : await Profile.create(profileData);

    await createAuditLog({
      user: req.user,
      action: existing ? 'UPDATE' : 'CREATE',
      entity: 'Profile',
      entityId: profile?._id?.toString(),
      req,
    });

    res.json({ data: profile, message: 'Profile saved' });
  } catch (err) {
    next(err);
  }
};

// ── Appointments ──────────────────────────────────────────────────────────────

export const adminGetAppointments = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await AcademicAppointment.find().sort({ displayOrder: 1, startDate: -1 }).lean();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const adminCreateAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await AcademicAppointment.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'AcademicAppointment', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await AcademicAppointment.findByIdAndUpdate((req.params.id as string), req.body, { new: true, runValidators: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'AcademicAppointment', entityId: doc._id.toString(), req });
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminDeleteAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await AcademicAppointment.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'AcademicAppointment', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Education ─────────────────────────────────────────────────────────────────

export const adminGetEducation = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Education.find().sort({ displayOrder: 1, completionDate: -1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminCreateEducation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Education.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'Education', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};

export const adminUpdateEducation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Education.findByIdAndUpdate((req.params.id as string), req.body, { new: true, runValidators: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'Education', entityId: doc._id.toString(), req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminDeleteEducation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Education.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'Education', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── External Profiles ─────────────────────────────────────────────────────────

export const adminGetExternalProfiles = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await ExternalProfile.find().sort({ displayOrder: 1 }).lean();
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminCreateExternalProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await ExternalProfile.create(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'ExternalProfile', entityId: doc._id.toString(), req });
    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
};

export const adminUpdateExternalProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await ExternalProfile.findByIdAndUpdate((req.params.id as string), req.body, { new: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'ExternalProfile', entityId: doc._id.toString(), req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminDeleteExternalProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await ExternalProfile.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'ExternalProfile', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

