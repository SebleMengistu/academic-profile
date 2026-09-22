import { AuditLog } from '../models/AuditLog';
import { AuditAction, JwtPayload, UserRole } from '../types';
import { Request } from 'express';
import { AuthRequest } from '../types';

export interface AuditOptions {
  user?: JwtPayload;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  req?: Request | AuthRequest;
}

export const createAuditLog = async (options: AuditOptions): Promise<void> => {
  try {
    const { user, action, entity, entityId, details, req } = options;

    await AuditLog.create({
      userId: user?.userId,
      userEmail: user?.email,
      userRole: user?.role,
      action,
      entity,
      entityId,
      details,
      ipAddress: req ? getIp(req) : undefined,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (err) {
    console.error('[AuditLog] Failed to create audit log:', err);
    // Never throw — audit failures should not break requests
  }
};

const getIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || '';
};
