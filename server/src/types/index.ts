import { Request } from 'express';

// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'PROFILE_OWNER' | 'EDITOR';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ── Content status ────────────────────────────────────────────────────────────
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
export type Visibility = 'PUBLIC' | 'PRIVATE';

// ── Upload ────────────────────────────────────────────────────────────────────
export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'PUBLISH' | 'UNPUBLISH' | 'ARCHIVE' | 'RESTORE'
  | 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN';
