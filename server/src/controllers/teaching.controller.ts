import { Request, Response, NextFunction } from 'express';
import supabase from '../lib/supabase';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';

// ── Teaching ──────────────────────────────────────────────────────────────────
export const getTeaching = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('teaching').select('*')
      .order('display_order').order('year', { ascending: false });
    if (error) throw error;
    res.json({ data: data ?? [] });
  } catch (err) { next(err); }
};

export const adminGetTeaching = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('teaching').select('*')
      .order('display_order').order('year', { ascending: false });
    if (error) throw error;
    res.json({ data: data ?? [] });
  } catch (err) { next(err); }
};

export const adminCreateTeaching = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('teaching').insert({
      course_name:   b.courseName,
      course_code:   b.courseCode   ?? null,
      institution:   b.institution,
      level:         b.level        ?? 'Undergraduate',
      semester:      b.semester     ?? null,
      year:          b.year         ?? null,
      description:   b.description  ?? null,
      display_order: b.displayOrder ?? 0,
    }).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'teaching', entityId: (data as any)?.id, req });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

export const adminUpdateTeaching = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const b = req.body;
    const { data, error } = await supabase.from('teaching').update({
      course_name:   b.courseName,
      course_code:   b.courseCode   ?? null,
      institution:   b.institution,
      level:         b.level,
      semester:      b.semester     ?? null,
      year:          b.year         ?? null,
      description:   b.description  ?? null,
      display_order: b.displayOrder ?? 0,
    }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'teaching', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminDeleteTeaching = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { error } = await supabase.from('teaching').delete().eq('id', id);
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'teaching', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── Supervision ───────────────────────────────────────────────────────────────
export const getSupervision = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('supervision').select('*')
      .order('start_date', { ascending: false });
    if (error) throw error;
    res.json({ data: data ?? [] });
  } catch (err) { next(err); }
};

export const adminGetSupervision = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('supervision').select('*')
      .order('start_date', { ascending: false });
    if (error) throw error;
    res.json({ data: data ?? [] });
  } catch (err) { next(err); }
};

export const adminCreateSupervision = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('supervision').insert({
      student_name:    b.studentName,
      degree:          b.degree,
      research_topic:  b.researchTopic,
      role:            b.role,
      start_date:      b.startDate      ?? null,
      completion_date: b.completionDate ?? null,
      status:          b.status         ?? 'Current',
      co_supervisors:  b.coSupervisors  ?? [],
      description:     b.description    ?? null,
      institution:     b.institution    ?? null,
    }).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'supervision', entityId: (data as any)?.id, req });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

export const adminUpdateSupervision = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const b = req.body;
    const { data, error } = await supabase.from('supervision').update({
      student_name:    b.studentName,
      degree:          b.degree,
      research_topic:  b.researchTopic,
      role:            b.role,
      start_date:      b.startDate      ?? null,
      completion_date: b.completionDate ?? null,
      status:          b.status,
      co_supervisors:  b.coSupervisors  ?? [],
      description:     b.description    ?? null,
      institution:     b.institution    ?? null,
    }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'supervision', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminDeleteSupervision = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { error } = await supabase.from('supervision').delete().eq('id', id);
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'supervision', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
