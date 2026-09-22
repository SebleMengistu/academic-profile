import { Request, Response, NextFunction } from 'express';
import supabase from '../lib/supabase';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/audit';
import * as cloudinaryService from '../services/cloudinary';

export const getMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { type } = req.query;
    let query = supabase.from('media').select('*', { count: 'exact' })
      .eq('visibility', 'PUBLIC')
      .order('date', { ascending: false })
      .range(skip, skip + limit - 1);
    if (type) query = query.eq('type', String(type));
    const { data, error, count } = await query;
    if (error) throw error;
    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

export const getMediaBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('media')
      .select('*').eq('slug', req.params.slug as string).eq('visibility', 'PUBLIC').maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    await supabase.from('media').update({ views: (data.views ?? 0) + 1 }).eq('id', data.id);
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminGetMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { type } = req.query;
    let query = supabase.from('media').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    if (type) query = query.eq('type', String(type));
    const { data, error, count } = await query;
    if (error) throw error;
    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

export const adminCreateMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const b = req.body as Record<string, unknown>;
    const slug = await generateUniqueSlug(b.title as string, 'media');
    const payload: Record<string, unknown> = {
      title: b.title, slug, type: b.type ?? 'Other',
      description: b.description ?? null, url: b.url ?? null,
      date: b.date ?? null, caption: b.caption ?? null,
      credit: b.credit ?? null, visibility: b.visibility ?? 'PUBLIC',
    };
    if (req.file) {
      const r = await cloudinaryService.uploadImage(req.file.buffer, 'media', { width: 800 });
      payload.thumbnail_url = r.url;
      payload.thumbnail_public_id = r.publicId;
    }
    const { data, error } = await supabase.from('media').insert(payload).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'media', entityId: (data as any)?.id, req });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

export const adminUpdateMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const b = req.body as Record<string, unknown>;
    const payload: Record<string, unknown> = {
      title: b.title, type: b.type, description: b.description ?? null,
      url: b.url ?? null, date: b.date ?? null,
      caption: b.caption ?? null, credit: b.credit ?? null,
      visibility: b.visibility ?? 'PUBLIC',
    };
    if (req.file) {
      const { data: ex } = await supabase.from('media').select('thumbnail_public_id').eq('id', id).maybeSingle();
      if (ex?.thumbnail_public_id) await cloudinaryService.deleteFile(ex.thumbnail_public_id as string).catch(() => {});
      const r = await cloudinaryService.uploadImage(req.file.buffer, 'media', { width: 800 });
      payload.thumbnail_url = r.url;
      payload.thumbnail_public_id = r.publicId;
    }
    const { data, error } = await supabase.from('media').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'media', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminDeleteMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { data: ex } = await supabase.from('media').select('thumbnail_public_id').eq('id', id).maybeSingle();
    if (ex?.thumbnail_public_id) await cloudinaryService.deleteFile(ex.thumbnail_public_id as string).catch(() => {});
    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'media', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
