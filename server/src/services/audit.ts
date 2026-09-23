import { AuditLog } from '../models/AuditLog';
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
    await AuditLog.create({
      userId:    opts.user?.userId,
      userEmail: opts.user?.email,
      userRole:  opts.user?.role,
      action:    opts.action,
      entity:    opts.entity,
      entityId:  opts.entityId,
      details:   opts.details,
      ipAddress: opts.req ? getIp(opts.req) : undefined,
      userAgent: opts.req?.headers?.['user-agent'],
    });
  } catch (err) {
    console.error('[AuditLog] Failed:', err);
  }
};
