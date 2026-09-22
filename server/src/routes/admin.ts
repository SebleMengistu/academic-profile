import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadImage, uploadDocument } from '../middleware/upload';
import { validate } from '../middleware/validate';

// Controllers
import {
  adminGetProfile,
  adminUpsertProfile,
  adminGetAppointments,
  adminCreateAppointment,
  adminUpdateAppointment,
  adminDeleteAppointment,
  adminGetEducation,
  adminCreateEducation,
  adminUpdateEducation,
  adminDeleteEducation,
  adminGetExternalProfiles,
  adminCreateExternalProfile,
  adminUpdateExternalProfile,
  adminDeleteExternalProfile,
} from '../controllers/profile.controller';

import {
  adminGetPublications,
  adminGetPublicationById,
  adminCreatePublication,
  adminUpdatePublication,
  adminDeletePublication,
  adminPublishPublication,
} from '../controllers/publication.controller';

import {
  adminGetResearchAreas,
  adminCreateResearchArea,
  adminUpdateResearchArea,
  adminDeleteResearchArea,
  adminGetFundedResearch,
  adminCreateFundedResearch,
  adminUpdateFundedResearch,
  adminDeleteFundedResearch,
} from '../controllers/research.controller';

import {
  adminGetTeaching,
  adminCreateTeaching,
  adminUpdateTeaching,
  adminDeleteTeaching,
  adminGetSupervision,
  adminCreateSupervision,
  adminUpdateSupervision,
  adminDeleteSupervision,
} from '../controllers/teaching.controller';

import {
  adminGetServiceLeadership,
  adminCreateServiceLeadership,
  adminUpdateServiceLeadership,
  adminDeleteServiceLeadership,
  adminGetAwards,
  adminCreateAward,
  adminUpdateAward,
  adminDeleteAward,
  adminGetMemberships,
  adminCreateMembership,
  adminUpdateMembership,
  adminDeleteMembership,
} from '../controllers/misc.controller';

import {
  adminGetMedia,
  adminCreateMedia,
  adminUpdateMedia,
  adminDeleteMedia,
} from '../controllers/media.controller';

import {
  adminGetMessages,
  adminGetMessageById,
  adminUpdateMessageStatus,
  adminDeleteMessage,
} from '../controllers/contact.controller';

import {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller';

// Validators
import { profileSchema, appointmentSchema, educationSchema } from '../validators/profile';
import { publicationSchema } from '../validators/publication';
import { researchAreaSchema, fundedResearchSchema } from '../validators/research';
import { contactStatusSchema } from '../validators/contact';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// ── Dashboard ──────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ── Profile ────────────────────────────────────────────────────────────────────
router.get('/profile', adminGetProfile);
router.put('/profile', uploadImage.single('photo'), validate(profileSchema), adminUpsertProfile);

// Appointments
router.get('/appointments', adminGetAppointments);
router.post('/appointments', validate(appointmentSchema), adminCreateAppointment);
router.put('/appointments/:id', validate(appointmentSchema), adminUpdateAppointment);
router.delete('/appointments/:id', adminDeleteAppointment);

// Education
router.get('/education', adminGetEducation);
router.post('/education', validate(educationSchema), adminCreateEducation);
router.put('/education/:id', validate(educationSchema), adminUpdateEducation);
router.delete('/education/:id', adminDeleteEducation);

// External profiles
router.get('/external-profiles', adminGetExternalProfiles);
router.post('/external-profiles', adminCreateExternalProfile);
router.put('/external-profiles/:id', adminUpdateExternalProfile);
router.delete('/external-profiles/:id', adminDeleteExternalProfile);

// ── Publications ───────────────────────────────────────────────────────────────
router.get('/publications', adminGetPublications);
router.get('/publications/:id', adminGetPublicationById);
router.post('/publications', uploadDocument.single('pdf'), validate(publicationSchema), adminCreatePublication);
router.put('/publications/:id', uploadDocument.single('pdf'), validate(publicationSchema), adminUpdatePublication);
router.delete('/publications/:id', adminDeletePublication);
router.patch('/publications/:id/publish', adminPublishPublication);

// ── Research ───────────────────────────────────────────────────────────────────
router.get('/research-areas', adminGetResearchAreas);
router.post('/research-areas', validate(researchAreaSchema), adminCreateResearchArea);
router.put('/research-areas/:id', validate(researchAreaSchema), adminUpdateResearchArea);
router.delete('/research-areas/:id', adminDeleteResearchArea);

router.get('/funded-research', adminGetFundedResearch);
router.post('/funded-research', validate(fundedResearchSchema), adminCreateFundedResearch);
router.put('/funded-research/:id', validate(fundedResearchSchema), adminUpdateFundedResearch);
router.delete('/funded-research/:id', adminDeleteFundedResearch);

// ── Teaching ───────────────────────────────────────────────────────────────────
router.get('/teaching', adminGetTeaching);
router.post('/teaching', adminCreateTeaching);
router.put('/teaching/:id', adminUpdateTeaching);
router.delete('/teaching/:id', adminDeleteTeaching);

router.get('/supervision', adminGetSupervision);
router.post('/supervision', adminCreateSupervision);
router.put('/supervision/:id', adminUpdateSupervision);
router.delete('/supervision/:id', adminDeleteSupervision);

// ── Service & Leadership ───────────────────────────────────────────────────────
router.get('/service-leadership', adminGetServiceLeadership);
router.post('/service-leadership', adminCreateServiceLeadership);
router.put('/service-leadership/:id', adminUpdateServiceLeadership);
router.delete('/service-leadership/:id', adminDeleteServiceLeadership);

router.get('/awards', adminGetAwards);
router.post('/awards', adminCreateAward);
router.put('/awards/:id', adminUpdateAward);
router.delete('/awards/:id', adminDeleteAward);

router.get('/memberships', adminGetMemberships);
router.post('/memberships', adminCreateMembership);
router.put('/memberships/:id', adminUpdateMembership);
router.delete('/memberships/:id', adminDeleteMembership);

// ── Media ──────────────────────────────────────────────────────────────────────
router.get('/media', adminGetMedia);
router.post('/media', uploadImage.single('thumbnail'), adminCreateMedia);
router.put('/media/:id', uploadImage.single('thumbnail'), adminUpdateMedia);
router.delete('/media/:id', adminDeleteMedia);

// ── Contact Messages ───────────────────────────────────────────────────────────
router.get('/contact', adminGetMessages);
router.get('/contact/:id', adminGetMessageById);
router.put('/contact/:id', validate(contactStatusSchema), adminUpdateMessageStatus);
router.delete('/contact/:id', adminDeleteMessage);

// ── Users (SUPER_ADMIN only) ───────────────────────────────────────────────────
router.get('/users', authorize('SUPER_ADMIN'), getUsers);
router.post('/users', authorize('SUPER_ADMIN'), createUser);
router.put('/users/:id', authorize('SUPER_ADMIN'), updateUser);
router.delete('/users/:id', authorize('SUPER_ADMIN'), deleteUser);

// ── Audit Logs ─────────────────────────────────────────────────────────────────
router.get('/audit-logs', authorize('SUPER_ADMIN'), getAuditLogs);

// ── Settings ───────────────────────────────────────────────────────────────────
router.get('/settings', getSettings);
router.put('/settings', authorize('SUPER_ADMIN', 'PROFILE_OWNER'), updateSettings);

export default router;
