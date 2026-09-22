import { Request, Response, NextFunction } from 'express';
import supabase from '../lib/supabase';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/audit';
import * as cloudinaryService from '../services/cloudinary';
import xss from 'xss';

const toRow = (body: Record<string, unknown>, slug?: string) => ({
  ...(slug !== undefined && { slug }),
  title:            body.title,
  abstract:         body.abstract ? xss(body.abstract as string) : null,
  publication_type: body.publicationType,
  authors:          body.authors ?? [],
  journal:          body.journal      ?? null,
  conference:       body.conference   ?? null,
  publisher:        body.publisher    ?? null,
  volume:           body.volume       ?? null,
  issue:            body.issue        ?? null,
  pages:            body.pages        ?? null,
  year:             body.year,
  publication_date: body.publicationDate ?? null,
  doi:              body.doi     ?? null,
  isbn:             body.isbn    ?? null,
  issn:             body.issn    ?? null,
  keywords:         body.keywords ?? [],
  citation:         body.citation ?? null,
  external_url:     body.externalUrl ?? null,
  research_area_ids: body.researchAreas ?? [],
  featured:         body.featured  ?? false,
  status:           body.status    ?? 'DRAFT',
  visibility:       body.visibility ?? 'PUBLIC',
});

// ── Public ────────────────────────────────────────────────────────────────────
export const getPublications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { q, year, type, area } = req.query;

    let query = supabase
      .from('publications')
      .select('*', { count: 'exact' })
      .eq('status', 'PUBLISHED')
      .eq('visibility', 'PUBLIC')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (year)  query = query.eq('year', Number(year));
    if (type)  query = query.eq('publication_type', String(type));
    if (area)  query = query.contains('research_area_ids', [String(area)]);
    if (q)     query = query.textSearch('title', String(q), { type: 'websearch' });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

export const getPublicationBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('slug', req.params.slug as string)
      .eq('status', 'PUBLISHED')
      .eq('visibility', 'PUBLIC')
      .maybeSingle();

    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }

    await supabase.from('publications').update({ views: (data.views ?? 0) + 1 }).eq('id', data.id);
    res.json({ data });
  } catch (err) { next(err); }
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminGetPublications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { q, year, type, status } = req.query;

    let query = supabase
      .from('publications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (year)   query = query.eq('year', Number(year));
    if (type)   query = query.eq('publication_type', String(type));
    if (status) query = query.eq('status', String(status));
    if (q)      query = query.textSearch('title', String(q), { type: 'websearch' });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

export const adminGetPublicationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('publications').select('*').eq('id', req.params.id as string).maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminCreatePublication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const slug = await generateUniqueSlug(body.title as string, 'publications');
    const payload: Record<string, unknown> = toRow(body, slug);

    if (req.file) {
      const result = await cloudinaryService.uploadFile(req.file.buffer, 'publications', `${slug}.pdf`);
      payload.pdf_url = result.url;
      payload.pdf_public_id = result.publicId;
    }

    const { data, error } = await supabase.from('publications').insert(payload).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'publications', entityId: (data as Record<string, unknown>)?.id as string, req });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

export const adminUpdatePublication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = req.body as Record<string, unknown>;

    const { data: existing, error: fetchErr } = await supabase.from('publications').select('slug,title,pdf_public_id').eq('id', id).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }

    let slug = (existing as any).slug as string;
    if (body.title && body.title !== (existing as any).title) {
      slug = await generateUniqueSlug(body.title as string, 'publications', id);
    }

    const payload: Record<string, unknown> = toRow(body, slug);

    if (req.file) {
      if (existing.pdf_public_id) await cloudinaryService.deleteRawFile(existing.pdf_public_id as string).catch(() => {});
      const result = await cloudinaryService.uploadFile(req.file.buffer, 'publications', `${slug}.pdf`);
      payload.pdf_url = result.url;
      payload.pdf_public_id = result.publicId;
    }

    const { data, error } = await supabase.from('publications').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'publications', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminDeletePublication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { data: existing } = await supabase.from('publications').select('pdf_public_id').eq('id', id).maybeSingle();
    if (existing?.pdf_public_id) await cloudinaryService.deleteRawFile(existing.pdf_public_id as string).catch(() => {});
    const { error } = await supabase.from('publications').delete().eq('id', id);
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'publications', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

export const adminPublishPublication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { data, error } = await supabase.from('publications').update({ status: 'PUBLISHED' }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'PUBLISH', entity: 'publications', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};
