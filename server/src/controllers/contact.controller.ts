import { Request, Response, NextFunction } from 'express';
import supabase from '../lib/supabase';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { createAuditLog } from '../services/audit';
import { sendContactNotification, sendContactAutoReply } from '../services/email';

export const submitContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;
    const { data, error } = await supabase.from('contact_messages').insert({
      name, email, subject: subject ?? null, message,
      ip_address: req.ip ?? null,
      user_agent: req.headers['user-agent'] ?? null,
    }).select('id').maybeSingle();
    if (error) throw error;

    sendContactNotification({ name, email, subject, message }).catch(console.error);
    sendContactAutoReply(email, name).catch(console.error);

    res.status(201).json({ message: 'Your message has been sent. Thank you!', id: (data as any)?.id });
  } catch (err) { next(err); }
};

export const adminGetMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;
    let query = supabase.from('contact_messages').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    if (status) query = query.eq('status', String(status));
    const { data, error, count } = await query;
    if (error) throw error;
    res.json(buildPaginatedResponse(data ?? [], count ?? 0, page, limit));
  } catch (err) { next(err); }
};

export const adminGetMessageById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { data, error } = await supabase.from('contact_messages').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    if ((data as any).status === 'New') {
      await supabase.from('contact_messages').update({ status: 'Read' }).eq('id', id);
    }
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminUpdateMessageStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const update: Record<string, unknown> = { status };
    if (status === 'Replied') update.replied_at = new Date().toISOString();
    const { data, error } = await supabase.from('contact_messages').update(update).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'contact_messages', entityId: id, req });
    res.json({ data });
  } catch (err) { next(err); }
};

export const adminDeleteMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'contact_messages', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
