import supabase from '../lib/supabase';
import { AuditAction, JwtPayload } from '../types';
import { Request } from 'express';

export interface AuditOptions {
  user?: JwtPayload;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  req?: Request;
}

const getIp = (req: Request): string => {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || '';
};

export const createAuditLog = async (opts: AuditOptions): Promise<void> => {
  try {
    await supabase.from('audit_logs').insert({
      user_id:    opts.user?.userId ?? null,
      user_email: opts.user?.email  ?? null,
      user_role:  opts.user?.role   ?? null,
      action:     opts.action,
      entity:     opts.entity,
      entity_id:  opts.entityId ?? null,
      details:    opts.details  ?? null,
      ip_address: opts.req ? getIp(opts.req) : null,
      user_agent: opts.req?.headers?.['user-agent'] ?? null,
    });
  } catch (err) {
    console.error('[AuditLog] Failed:', err);
  }
};
