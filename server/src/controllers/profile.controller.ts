import { Request, Response, NextFunction } from 'express';
import supabase from '../lib/supabase';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';
import * as cloudinaryService from '../services/cloudinary';

// ── helpers ───────────────────────────────────────────────────────────────────
const snakeToCamel = (row: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
};

// ── Public ────────────────────────────────────────────────────────────────────
export const getPublicProfile = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('visibility', 'PUBLIC').maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Profile not found' }); return; }
    res.json({ data: snakeToCamel(data) });
  } catch (err) { next(err); }
};

export const getPublicAppointments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('academic_appointments').select('*').order('display_order').order('start_date', { ascending: false });
    if (error) throw error;
    res.json({ data: (data ?? []).map(snakeToCamel) });
  } catch (err) { next(err); }
};

export const getPublicEducation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('education').select('*').order('display_order').order('completion_date', { ascending: false });
    if (error) throw error;
    res.json({ data: (data ?? []).map(snakeToCamel) });
  } catch (err) { next(err); }
};

export const getPublicExternalProfiles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('external_profiles').select('*').eq('active', true).order('display_order');
    if (error) throw error;
    res.json({ data: (data ?? []).map(snakeToCamel) });
  } catch (err) { next(err); }
};

export const getPublicMemberships = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('memberships').select('*').order('display_order');
    if (error) throw error;
    res.json({ data: (data ?? []).map(snakeToCamel) });
  } catch (err) { next(err); }
};

// ── Admin Profile ─────────────────────────────────────────────────────────────
export const adminGetProfile = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
    if (error) throw error;
    res.json({ data: data ? snakeToCamel(data) : null });
  } catch (err) { next(err); }
};

export const adminUpsertProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body;
    const payload: Record<string, unknown> = {
      title: body.title, first_name: body.firstName, middle_name: body.middleName,
      last_name: body.lastName, display_name: body.displayName,
      professional_title: body.professionalTitle, current_position: body.currentPosition,
      department: body.department, faculty: body.faculty, institution: body.institution,
      short_bio: body.shortBio, biography: body.biography,
      research_statement: body.researchStatement, career_summary: body.careerSummary,
      email: body.email, phone: body.phone, office: body.office,
      address: body.address, country: body.country, orcid: body.orcid,
      profile_type: body.profileType, visibility: body.visibility || 'PUBLIC',
    };

    if (req.file) {
      const { data: existing } = await supabase.from('profiles').select('profile_photo_public_id').maybeSingle();
      if (existing?.profile_photo_public_id) {
        await cloudinaryService.deleteFile(existing.profile_photo_public_id).catch(() => {});
      }
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'profile', { width: 400, height: 400 });
      payload.profile_photo = result.url;
      payload.profile_photo_public_id = result.publicId;
    }

    const { data: existing } = await supabase.from('profiles').select('id').maybeSingle();
    let result;
    if (existing) {
      const { data, error } = await supabase.from('profiles').update(payload).eq('id', existing.id).select().maybeSingle();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase.from('profiles').insert(payload).select().maybeSingle();
      if (error) throw error;
      result = data;
    }

    await createAuditLog({ user: req.user, action: existing ? 'UPDATE' : 'CREATE', entity: 'Profile', req });
    res.json({ data: result ? snakeToCamel(result as Record<string, unknown>) : null, message: 'Profile saved' });
  } catch (err) { next(err); }
};

// ── Generic CRUD factory ──────────────────────────────────────────────────────
type FieldMap = Record<string, string>; // camelCase -> snake_case

const toSnake = (body: Record<string, unknown>, fieldMap: FieldMap): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (body[camel] !== undefined) out[snake] = body[camel];
  }
  return out;
};

const crudHandlers = (table: string, fieldMap: FieldMap, orderCol = 'created_at') => ({
  getAll: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase.from(table).select('*').order(orderCol, { ascending: false });
      if (error) throw error;
      res.json({ data: (data ?? []).map(snakeToCamel) });
    } catch (err) { next(err); }
  },
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payload = toSnake(req.body as Record<string, unknown>, fieldMap);
      const { data, error } = await supabase.from(table).insert(payload).select().maybeSingle();
      if (error) throw error;
      await createAuditLog({ user: req.user, action: 'CREATE', entity: table, entityId: (data as Record<string, unknown>)?.id as string, req });
      res.status(201).json({ data: data ? snakeToCamel(data as Record<string, unknown>) : null });
    } catch (err) { next(err); }
  },
  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const payload = toSnake(req.body as Record<string, unknown>, fieldMap);
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().maybeSingle();
      if (error) throw error;
      if (!data) { res.status(404).json({ message: 'Not found' }); return; }
      await createAuditLog({ user: req.user, action: 'UPDATE', entity: table, entityId: id, req });
      res.json({ data: snakeToCamel(data as Record<string, unknown>) });
    } catch (err) { next(err); }
  },
  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      await createAuditLog({ user: req.user, action: 'DELETE', entity: table, entityId: id, req });
      res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
  },
});

// ── Appointments ──────────────────────────────────────────────────────────────
const apptMap: FieldMap = {
  title: 'title', institution: 'institution', faculty: 'faculty', department: 'department',
  location: 'location', startDate: 'start_date', endDate: 'end_date', isCurrent: 'is_current',
  description: 'description', displayOrder: 'display_order',
};
export const adminGetAppointments  = crudHandlers('academic_appointments', apptMap, 'display_order').getAll;
export const adminCreateAppointment = crudHandlers('academic_appointments', apptMap, 'display_order').create;
export const adminUpdateAppointment = crudHandlers('academic_appointments', apptMap, 'display_order').update;
export const adminDeleteAppointment = crudHandlers('academic_appointments', apptMap, 'display_order').delete;

// ── Education ─────────────────────────────────────────────────────────────────
const eduMap: FieldMap = {
  degree: 'degree', field: 'field', institution: 'institution', location: 'location',
  country: 'country', startDate: 'start_date', completionDate: 'completion_date',
  thesisTitle: 'thesis_title', thesisUrl: 'thesis_url', description: 'description',
  displayOrder: 'display_order',
};
export const adminGetEducation  = crudHandlers('education', eduMap, 'display_order').getAll;
export const adminCreateEducation = crudHandlers('education', eduMap, 'display_order').create;
export const adminUpdateEducation = crudHandlers('education', eduMap, 'display_order').update;
export const adminDeleteEducation = crudHandlers('education', eduMap, 'display_order').delete;

// ── External Profiles ─────────────────────────────────────────────────────────
const extMap: FieldMap = {
  platform: 'platform', label: 'label', url: 'url', icon: 'icon',
  displayOrder: 'display_order', active: 'active',
};
export const adminGetExternalProfiles  = crudHandlers('external_profiles', extMap, 'display_order').getAll;
export const adminCreateExternalProfile = crudHandlers('external_profiles', extMap, 'display_order').create;
export const adminUpdateExternalProfile = crudHandlers('external_profiles', extMap, 'display_order').update;
export const adminDeleteExternalProfile = crudHandlers('external_profiles', extMap, 'display_order').delete;
