import { Router } from 'express';
import {
  getPublicProfile,
  getPublicAppointments,
  getPublicEducation,
  getPublicExternalProfiles,
  getPublicMemberships,
} from '../controllers/profile.controller';
import { getPublications, getPublicationBySlug } from '../controllers/publication.controller';
import { getResearchAreas, getFundedResearch, getFundedResearchBySlug } from '../controllers/research.controller';
import { getTeaching, getSupervision } from '../controllers/teaching.controller';
import { getServiceLeadership, getAwards } from '../controllers/misc.controller';
import { getMedia, getMediaBySlug } from '../controllers/media.controller';
import { submitContact } from '../controllers/contact.controller';
import { search } from '../controllers/admin.controller';
import { validate } from '../middleware/validate';
import { contactSchema } from '../validators/contact';

const router = Router();

// Profile
router.get('/profile', getPublicProfile);
router.get('/appointments', getPublicAppointments);
router.get('/education', getPublicEducation);
router.get('/external-profiles', getPublicExternalProfiles);
router.get('/memberships', getPublicMemberships);

// Publications
router.get('/publications', getPublications);
router.get('/publications/:slug', getPublicationBySlug);

// Research
router.get('/research-areas', getResearchAreas);
router.get('/funded-research', getFundedResearch);
router.get('/funded-research/:slug', getFundedResearchBySlug);

// Academic
router.get('/teaching', getTeaching);
router.get('/supervision', getSupervision);
router.get('/service-leadership', getServiceLeadership);
router.get('/awards', getAwards);

// Media
router.get('/media', getMedia);
router.get('/media/:slug', getMediaBySlug);

// Contact
router.post('/contact', validate(contactSchema), submitContact);

// Search
router.get('/search', search);

export default router;
