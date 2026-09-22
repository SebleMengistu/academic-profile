import api from './api';

const a = '/admin';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data).then((r) => r.data);

export const logout = () => api.post('/auth/logout').then((r) => r.data);

export const getMe = () => api.get('/auth/me').then((r) => r.data);

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.put('/auth/change-password', data).then((r) => r.data);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () =>
  api.get(`${a}/dashboard`).then((r) => r.data.data);

// ── Profile ───────────────────────────────────────────────────────────────────
export const adminGetProfile = () =>
  api.get(`${a}/profile`).then((r) => r.data.data);

export const adminUpsertProfile = (data: FormData) =>
  api.put(`${a}/profile`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

// ── Appointments ──────────────────────────────────────────────────────────────
export const adminGetAppointments = () =>
  api.get(`${a}/appointments`).then((r) => r.data.data);

export const adminCreateAppointment = (data: unknown) =>
  api.post(`${a}/appointments`, data).then((r) => r.data);

export const adminUpdateAppointment = (id: string, data: unknown) =>
  api.put(`${a}/appointments/${id}`, data).then((r) => r.data);

export const adminDeleteAppointment = (id: string) =>
  api.delete(`${a}/appointments/${id}`).then((r) => r.data);

// ── Education ─────────────────────────────────────────────────────────────────
export const adminGetEducation = () =>
  api.get(`${a}/education`).then((r) => r.data.data);

export const adminCreateEducation = (data: unknown) =>
  api.post(`${a}/education`, data).then((r) => r.data);

export const adminUpdateEducation = (id: string, data: unknown) =>
  api.put(`${a}/education/${id}`, data).then((r) => r.data);

export const adminDeleteEducation = (id: string) =>
  api.delete(`${a}/education/${id}`).then((r) => r.data);

// ── External Profiles ─────────────────────────────────────────────────────────
export const adminGetExternalProfiles = () =>
  api.get(`${a}/external-profiles`).then((r) => r.data.data);

export const adminCreateExternalProfile = (data: unknown) =>
  api.post(`${a}/external-profiles`, data).then((r) => r.data);

export const adminUpdateExternalProfile = (id: string, data: unknown) =>
  api.put(`${a}/external-profiles/${id}`, data).then((r) => r.data);

export const adminDeleteExternalProfile = (id: string) =>
  api.delete(`${a}/external-profiles/${id}`).then((r) => r.data);

// ── Publications ──────────────────────────────────────────────────────────────
export const adminGetPublications = (params?: Record<string, unknown>) =>
  api.get(`${a}/publications`, { params }).then((r) => r.data);

export const adminGetPublicationById = (id: string) =>
  api.get(`${a}/publications/${id}`).then((r) => r.data.data);

export const adminCreatePublication = (data: FormData) =>
  api.post(`${a}/publications`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const adminUpdatePublication = (id: string, data: FormData) =>
  api.put(`${a}/publications/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const adminDeletePublication = (id: string) =>
  api.delete(`${a}/publications/${id}`).then((r) => r.data);

export const adminPublishPublication = (id: string) =>
  api.patch(`${a}/publications/${id}/publish`).then((r) => r.data);

// ── Research Areas ────────────────────────────────────────────────────────────
export const adminGetResearchAreas = () =>
  api.get(`${a}/research-areas`).then((r) => r.data.data);

export const adminCreateResearchArea = (data: unknown) =>
  api.post(`${a}/research-areas`, data).then((r) => r.data);

export const adminUpdateResearchArea = (id: string, data: unknown) =>
  api.put(`${a}/research-areas/${id}`, data).then((r) => r.data);

export const adminDeleteResearchArea = (id: string) =>
  api.delete(`${a}/research-areas/${id}`).then((r) => r.data);

// ── Funded Research ───────────────────────────────────────────────────────────
export const adminGetFundedResearch = (params?: Record<string, unknown>) =>
  api.get(`${a}/funded-research`, { params }).then((r) => r.data);

export const adminCreateFundedResearch = (data: unknown) =>
  api.post(`${a}/funded-research`, data).then((r) => r.data);

export const adminUpdateFundedResearch = (id: string, data: unknown) =>
  api.put(`${a}/funded-research/${id}`, data).then((r) => r.data);

export const adminDeleteFundedResearch = (id: string) =>
  api.delete(`${a}/funded-research/${id}`).then((r) => r.data);

// ── Teaching ──────────────────────────────────────────────────────────────────
export const adminGetTeaching = () =>
  api.get(`${a}/teaching`).then((r) => r.data.data);

export const adminCreateTeaching = (data: unknown) =>
  api.post(`${a}/teaching`, data).then((r) => r.data);

export const adminUpdateTeaching = (id: string, data: unknown) =>
  api.put(`${a}/teaching/${id}`, data).then((r) => r.data);

export const adminDeleteTeaching = (id: string) =>
  api.delete(`${a}/teaching/${id}`).then((r) => r.data);

// ── Supervision ───────────────────────────────────────────────────────────────
export const adminGetSupervision = () =>
  api.get(`${a}/supervision`).then((r) => r.data.data);

export const adminCreateSupervision = (data: unknown) =>
  api.post(`${a}/supervision`, data).then((r) => r.data);

export const adminUpdateSupervision = (id: string, data: unknown) =>
  api.put(`${a}/supervision/${id}`, data).then((r) => r.data);

export const adminDeleteSupervision = (id: string) =>
  api.delete(`${a}/supervision/${id}`).then((r) => r.data);

// ── Service & Leadership ──────────────────────────────────────────────────────
export const adminGetServiceLeadership = () =>
  api.get(`${a}/service-leadership`).then((r) => r.data.data);

export const adminCreateServiceLeadership = (data: unknown) =>
  api.post(`${a}/service-leadership`, data).then((r) => r.data);

export const adminUpdateServiceLeadership = (id: string, data: unknown) =>
  api.put(`${a}/service-leadership/${id}`, data).then((r) => r.data);

export const adminDeleteServiceLeadership = (id: string) =>
  api.delete(`${a}/service-leadership/${id}`).then((r) => r.data);

// ── Awards ────────────────────────────────────────────────────────────────────
export const adminGetAwards = () =>
  api.get(`${a}/awards`).then((r) => r.data.data);

export const adminCreateAward = (data: unknown) =>
  api.post(`${a}/awards`, data).then((r) => r.data);

export const adminUpdateAward = (id: string, data: unknown) =>
  api.put(`${a}/awards/${id}`, data).then((r) => r.data);

export const adminDeleteAward = (id: string) =>
  api.delete(`${a}/awards/${id}`).then((r) => r.data);

// ── Memberships ───────────────────────────────────────────────────────────────
export const adminGetMemberships = () =>
  api.get(`${a}/memberships`).then((r) => r.data.data);

export const adminCreateMembership = (data: unknown) =>
  api.post(`${a}/memberships`, data).then((r) => r.data);

export const adminUpdateMembership = (id: string, data: unknown) =>
  api.put(`${a}/memberships/${id}`, data).then((r) => r.data);

export const adminDeleteMembership = (id: string) =>
  api.delete(`${a}/memberships/${id}`).then((r) => r.data);

// ── Media ─────────────────────────────────────────────────────────────────────
export const adminGetMedia = (params?: Record<string, unknown>) =>
  api.get(`${a}/media`, { params }).then((r) => r.data);

export const adminCreateMedia = (data: FormData) =>
  api.post(`${a}/media`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const adminUpdateMedia = (id: string, data: FormData) =>
  api.put(`${a}/media/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const adminDeleteMedia = (id: string) =>
  api.delete(`${a}/media/${id}`).then((r) => r.data);

// ── Contact ───────────────────────────────────────────────────────────────────
export const adminGetMessages = (params?: Record<string, unknown>) =>
  api.get(`${a}/contact`, { params }).then((r) => r.data);

export const adminGetMessageById = (id: string) =>
  api.get(`${a}/contact/${id}`).then((r) => r.data.data);

export const adminUpdateMessageStatus = (id: string, status: string) =>
  api.put(`${a}/contact/${id}`, { status }).then((r) => r.data);

export const adminDeleteMessage = (id: string) =>
  api.delete(`${a}/contact/${id}`).then((r) => r.data);

// ── Users ─────────────────────────────────────────────────────────────────────
export const adminGetUsers = (params?: Record<string, unknown>) =>
  api.get(`${a}/users`, { params }).then((r) => r.data);

export const adminCreateUser = (data: unknown) =>
  api.post(`${a}/users`, data).then((r) => r.data);

export const adminUpdateUser = (id: string, data: unknown) =>
  api.put(`${a}/users/${id}`, data).then((r) => r.data);

export const adminDeleteUser = (id: string) =>
  api.delete(`${a}/users/${id}`).then((r) => r.data);

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const adminGetAuditLogs = (params?: Record<string, unknown>) =>
  api.get(`${a}/audit-logs`, { params }).then((r) => r.data);

// ── Settings ──────────────────────────────────────────────────────────────────
export const adminGetSettings = () =>
  api.get(`${a}/settings`).then((r) => r.data.data);

export const adminUpdateSettings = (data: unknown) =>
  api.put(`${a}/settings`, data).then((r) => r.data);
