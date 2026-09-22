import { Response, NextFunction } from 'express';
import supabase from '../lib/supabase';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types';
import { createAuditLog } from '../services/audit';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [pubs, funded, awards, teaching, media, messages, users, activity] = await Promise.all([
      supabase.from('publications').select('id', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
      supabase.from('funded_research').select('id', { count: 'exact', head: true }),
      supabase.from('awards').select('id', { count: 'exact', head: true }),
      supabase.from('teaching').select('id', { count: 'exact', head: true }),
      supabase.from('media').select('id', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'New'),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    // Publications by year
    const { data: pubsByYear } = await supabase
      .from('publications')
      .select('year')
      .eq('status', 'PUBLISHED');

    const yearMap: Record<number, number> = {};
    (pubsByYear ?? []).forEach((p: any) => { yearMap[p.year] = (yearMap[p.year] ?? 0) + 1; });
    const publicationsByYear = Object.entries(yearMap)
      .map(([_id, count]) => ({ _id: Number(_id), count }))
      .sort((a, b) => b._id - a._id).slice(0, 10);

    // Publication types
    const { data: pubsData } = await supabase.from('publications').select('publication_type').eq('status', 'PUBLISHED');
    const typeMap: Record<string, number> = {};
    (pubsData ?? []).forEach((p: any) => { typeMap[p.publication_type] = (typeMap[p.publication_type] ?? 0) + 1; });
    const publicationTypes = Object.entries(typeMap)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      data: {
        stats: {
          totalPublications: pubs.count ?? 0,
          fundedProjects:    funded.count ?? 0,
          awards:            awards.count ?? 0,
          teachingRecords:   teaching.count ?? 0,
          mediaItems:        media.count ?? 0,
          newMessages:       messages.count ?? 0,
          totalUsers:        users.count ?? 0,
        },
        charts: { publicationsByYear, publicationTypes },
        recentActivity: activity.data ?? [],
      },
    });
  } catch (err) { next(err); }
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { data, error, count } = await supabase
      .from('users').select('id,first_name,last_name,email,role,is_active,last_login,created_at', { count: 'exact' })
      .order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    if (error) throw error;
    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase.from('users').insert({
      first_name: firstName, last_name: lastName,
      email: email.toLowerCase(), password_hash: hash, role: role ?? 'EDITOR',
    }).select('id,first_name,last_name,email,role,is_active,created_at').maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'users', entityId: (data as any)?.id, req });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { firstName, lastName, role, isActive } = req.body;
    const { data, error } = await supabase.from('users').update({
      first_name: firstName, last_name: lastName, role, is_active: isActive,
    }).eq('id', id).select('id,first_name,last_name,email,role,is_active').maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'users', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (req.user?.userId === id) { res.status(400).json({ message: 'Cannot delete your own account' }); return; }
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'users', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { entity, action } = req.query;
    let query = supabase.from('audit_logs').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    if (entity) query = query.eq('entity', String(entity));
    if (action) query = query.eq('action', String(action));
    const { data, error, count } = await query;
    if (error) throw error;
    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const getSettings = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('settings').select('*').maybeSingle();
    if (error) throw error;
    res.json({ data: data ?? {} });
  } catch (err) { next(err); }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const b = req.body;
    const payload = {
      site_name:           b.siteName,
      site_url:            b.siteUrl            ?? null,
      seo:                 b.seo                ?? null,
      maintenance_mode:    b.maintenanceMode    ?? false,
      allow_contact_form:  b.allowContactForm   ?? true,
      analytics_enabled:   b.analyticsEnabled   ?? true,
      google_analytics_id: b.googleAnalyticsId  ?? null,
      footer_text:         b.footerText         ?? null,
    };
    const { data: ex } = await supabase.from('settings').select('id').maybeSingle();
    const { data, error } = ex
      ? await supabase.from('settings').update(payload).eq('id', (ex as any).id).select().maybeSingle()
      : await supabase.from('settings').insert(payload).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'settings', req });
    res.json({ data });
  } catch (err) { next(err); }
};

// ── Search ────────────────────────────────────────────────────────────────────
export const search = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = String(req.query.q || '');
    if (!q) { res.json({ data: { publications: [], research: [], media: [] } }); return; }

    const [pubs, research, media] = await Promise.all([
      supabase.from('publications').select('id,title,slug,year,publication_type,status')
        .eq('status', 'PUBLISHED').ilike('title', `%${q}%`).limit(5),
      supabase.from('funded_research').select('id,title,slug,status,content_status')
        .eq('content_status', 'PUBLISHED').ilike('title', `%${q}%`).limit(5),
      supabase.from('media').select('id,title,slug,type')
        .eq('visibility', 'PUBLIC').ilike('title', `%${q}%`).limit(5),
    ]);

    res.json({ data: { publications: pubs.data ?? [], research: research.data ?? [], media: media.data ?? [] } });
  } catch (err) { next(err); }
};
