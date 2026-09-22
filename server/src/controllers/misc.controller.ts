import { Request, Response, NextFunction } from 'express';
import supabase from '../lib/supabase';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';

const crud = (table: string) => ({
  getPublic: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase.from(table).select('*').order('display_order');
      if (error) throw error;
      res.json({ data: data ?? [] });
    } catch (err) { next(err); }
  },
  getAdmin: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase.from(table).select('*').order('display_order');
      if (error) throw error;
      res.json({ data: data ?? [] });
    } catch (err) { next(err); }
  },
  create: (mapFn: (b: Record<string,unknown>) => Record<string,unknown>) =>
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { data, error } = await supabase.from(table).insert(mapFn(req.body)).select().maybeSingle();
        if (error) throw error;
        await createAuditLog({ user: req.user, action: 'CREATE', entity: table, entityId: (data as any)?.id, req });
        res.status(201).json({ data });
      } catch (err) { next(err); }
    },
  update: (mapFn: (b: Record<string,unknown>) => Record<string,unknown>) =>
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id as string;
        const { data, error } = await supabase.from(table).update(mapFn(req.body)).eq('id', id).select().maybeSingle();
        if (error) throw error;
        if (!data) { res.status(404).json({ message: 'Not found' }); return; }
        await createAuditLog({ user: req.user, action: 'UPDATE', entity: table, entityId: id, req });
        res.json({ data });
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

// ── Service & Leadership ──────────────────────────────────────────────────────
const svcMap = (b: Record<string,unknown>) => ({
  role: b.role, organization: b.organization, type: b.type,
  description: b.description ?? null, start_date: b.startDate ?? null,
  end_date: b.endDate ?? null, is_current: b.isCurrent ?? false,
  external_url: b.externalUrl ?? null, display_order: b.displayOrder ?? 0,
});
const svc = crud('service_leadership');
export const getServiceLeadership      = svc.getPublic;
export const adminGetServiceLeadership = svc.getAdmin;
export const adminCreateServiceLeadership = svc.create(svcMap);
export const adminUpdateServiceLeadership = svc.update(svcMap);
export const adminDeleteServiceLeadership = svc.delete;

// ── Awards ────────────────────────────────────────────────────────────────────
const awardMap = (b: Record<string,unknown>) => ({
  name: b.name, organization: b.organization, date: b.date ?? null,
  category: b.category ?? null, description: b.description ?? null,
  certificate_url: b.certificateUrl ?? null, external_url: b.externalUrl ?? null,
  display_order: b.displayOrder ?? 0,
});
const aw = crud('awards');
export const getAwards      = aw.getPublic;
export const adminGetAwards = aw.getAdmin;
export const adminCreateAward = aw.create(awardMap);
export const adminUpdateAward = aw.update(awardMap);
export const adminDeleteAward = aw.delete;

// ── Memberships ───────────────────────────────────────────────────────────────
const memMap = (b: Record<string,unknown>) => ({
  organization: b.organization, role: b.role ?? null,
  membership_type: b.membershipType ?? null,
  start_date: b.startDate ?? null, end_date: b.endDate ?? null,
  is_current: b.isCurrent ?? true, external_url: b.externalUrl ?? null,
  display_order: b.displayOrder ?? 0,
});
const mem = crud('memberships');
export const adminGetMemberships  = mem.getAdmin;
export const adminCreateMembership = mem.create(memMap);
export const adminUpdateMembership = mem.update(memMap);
export const adminDeleteMembership = mem.delete;
