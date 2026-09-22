import { Request, Response, NextFunction } from 'express';
import supabase from '../lib/supabase';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/audit';
import xss from 'xss';

// ── Research Areas ────────────────────────────────────────────────────────────
export const getResearchAreas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('research_areas').select('*').order('display_order');
    if (error) throw error;
    res.json({ data: data ?? [] });
  } catch (err) { next(err); }
};

export const adminGetResearchAreas = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('research_areas').select('*').order('display_order');
    if (error) throw error;
    res.json({ data: data ?? [] });
  } catch (err) { next(err); }
};

export const adminCreateResearchArea = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, icon, displayOrder } = req.body;
    const slug = await generateUniqueSlug(name, 'research_areas');
    const { data, error } = await supabase.from('research_areas').insert({
      name, slug, description: description ?? null, icon: icon ?? null, display_order: displayOrder ?? 0,
    }).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'research_areas', entityId: (data as Record<string, unknown>)?.id as string, req });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

export const adminUpdateResearchArea = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, description, icon, displayOrder } = req.body;
    const { data: existing } = await supabase.from('research_areas').select('name').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }

    const payload: Record<string, unknown> = { description: description ?? null, icon: icon ?? null, display_order: displayOrder ?? 0 };
    if (name && name !== (existing as Record<string, unknown>).name) {
      payload.name = name;
      payload.slug = await generateUniqueSlug(name, 'research_areas', id);
    } else if (name) { payload.name = name; }

    const { data, error } = await supabase.from('research_areas').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'research_areas', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminDeleteResearchArea = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { error } = await supabase.from('research_areas').delete().eq('id', id);
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'research_areas', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── Funded Research ───────────────────────────────────────────────────────────
const toFRRow = (body: Record<string, unknown>, slug?: string) => ({
  ...(slug !== undefined && { slug }),
  title: body.title,
  description: body.description ? xss(body.description as string) : null,
  funding_type: body.fundingType,
  funder: body.funder,
  funding_scheme: body.fundingScheme ?? null,
  grant_number: body.grantNumber ?? null,
  amount: body.amount ?? null,
  currency: body.currency ?? 'USD',
  start_date: body.startDate,
  end_date: body.endDate ?? null,
  status: body.status ?? 'ACTIVE',
  principal_investigator: body.principalInvestigator,
  team_members: body.teamMembers ?? [],
  research_area_ids: body.researchAreas ?? [],
  external_url: body.externalUrl ?? null,
  featured: body.featured ?? false,
  content_status: body.contentStatus ?? 'DRAFT',
});

export const getFundedResearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { data, error, count } = await supabase
      .from('funded_research')
      .select('*', { count: 'exact' })
      .eq('content_status', 'PUBLISHED')
      .order('start_date', { ascending: false })
      .range(skip, skip + limit - 1);
    if (error) throw error;
    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

export const getFundedResearchBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('funded_research')
      .select('*')
      .eq('slug', req.params.slug as string)
      .eq('content_status', 'PUBLISHED')
      .maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    await supabase.from('funded_research').update({ views: (data.views ?? 0) + 1 }).eq('id', data.id);
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminGetFundedResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;
    let query = supabase.from('funded_research').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    if (status) query = query.eq('status', String(status));
    const { data, error, count } = await query;
    if (error) throw error;
    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

export const adminCreateFundedResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const slug = await generateUniqueSlug(body.title as string, 'funded_research');
    const { data, error } = await supabase.from('funded_research').insert(toFRRow(body, slug)).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'CREATE', entity: 'funded_research', entityId: (data as Record<string, unknown>)?.id as string, req });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

export const adminUpdateFundedResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = req.body as Record<string, unknown>;
    const { data: existing } = await supabase.from('funded_research').select('slug,title').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }

    let slug = (existing as Record<string, unknown>).slug as string;
    if (body.title && body.title !== (existing as Record<string, unknown>).title) {
      slug = await generateUniqueSlug(body.title as string, 'funded_research', id);
    }
    const { data, error } = await supabase.from('funded_research').update(toFRRow(body, slug)).eq('id', id).select().maybeSingle();
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'funded_research', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminDeleteFundedResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { error } = await supabase.from('funded_research').delete().eq('id', id);
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'funded_research', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
