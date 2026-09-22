import api from './api';
import {
  Profile, AcademicAppointment, Education, ExternalProfile, Membership,
  Publication, ResearchArea, FundedResearch, Teaching, Supervision,
  ServiceLeadership, Award, Media, PaginatedResponse
} from '../types';

// ── Profile ───────────────────────────────────────────────────────────────────
export const fetchProfile = () =>
  api.get<{ data: Profile }>('/profile').then((r) => r.data.data);

export const fetchAppointments = () =>
  api.get<{ data: AcademicAppointment[] }>('/appointments').then((r) => r.data.data);

export const fetchEducation = () =>
  api.get<{ data: Education[] }>('/education').then((r) => r.data.data);

export const fetchExternalProfiles = () =>
  api.get<{ data: ExternalProfile[] }>('/external-profiles').then((r) => r.data.data);

export const fetchMemberships = () =>
  api.get<{ data: Membership[] }>('/memberships').then((r) => r.data.data);

// ── Publications ──────────────────────────────────────────────────────────────
export const fetchPublications = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Publication>>('/publications', { params }).then((r) => r.data);

export const fetchPublicationBySlug = (slug: string) =>
  api.get<{ data: Publication }>(`/publications/${slug}`).then((r) => r.data.data);

// ── Research ──────────────────────────────────────────────────────────────────
export const fetchResearchAreas = () =>
  api.get<{ data: ResearchArea[] }>('/research-areas').then((r) => r.data.data);

export const fetchFundedResearch = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<FundedResearch>>('/funded-research', { params }).then((r) => r.data);

export const fetchFundedResearchBySlug = (slug: string) =>
  api.get<{ data: FundedResearch }>(`/funded-research/${slug}`).then((r) => r.data.data);

// ── Teaching ──────────────────────────────────────────────────────────────────
export const fetchTeaching = () =>
  api.get<{ data: Teaching[] }>('/teaching').then((r) => r.data.data);

export const fetchSupervision = () =>
  api.get<{ data: Supervision[] }>('/supervision').then((r) => r.data.data);

// ── Service & Awards ──────────────────────────────────────────────────────────
export const fetchServiceLeadership = () =>
  api.get<{ data: ServiceLeadership[] }>('/service-leadership').then((r) => r.data.data);

export const fetchAwards = () =>
  api.get<{ data: Award[] }>('/awards').then((r) => r.data.data);

// ── Media ─────────────────────────────────────────────────────────────────────
export const fetchMedia = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Media>>('/media', { params }).then((r) => r.data);

export const fetchMediaBySlug = (slug: string) =>
  api.get<{ data: Media }>(`/media/${slug}`).then((r) => r.data.data);

// ── Contact ───────────────────────────────────────────────────────────────────
export const submitContact = (data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) => api.post('/contact', data).then((r) => r.data);

// ── Search ────────────────────────────────────────────────────────────────────
export const search = (q: string) =>
  api.get<{ data: { publications: Publication[]; research: FundedResearch[]; media: Media[] } }>(
    '/search',
    { params: { q } }
  ).then((r) => r.data.data);
