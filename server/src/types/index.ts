import { Request } from 'express';
import { Document, Types } from 'mongoose';

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
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

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

// ── Analytics ─────────────────────────────────────────────────────────────────
export type AnalyticsEventType =
  | 'PROFILE_VIEW'
  | 'PUBLICATION_VIEW'
  | 'RESEARCH_VIEW'
  | 'MEDIA_VIEW'
  | 'CV_DOWNLOAD'
  | 'EXTERNAL_LINK_CLICK'
  | 'CONTACT_SUBMISSION';

// ── Service Response ──────────────────────────────────────────────────────────
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_LOGIN';
