import Joi from 'joi';

export const profileSchema = Joi.object({
  title: Joi.string().allow('', null),
  firstName: Joi.string().min(1).max(50).required(),
  middleName: Joi.string().allow('', null),
  lastName: Joi.string().min(1).max(50).required(),
  displayName: Joi.string().min(1).max(100).required(),
  professionalTitle: Joi.string().allow('', null),
  currentPosition: Joi.string().allow('', null),
  department: Joi.string().allow('', null),
  faculty: Joi.string().allow('', null),
  institution: Joi.string().allow('', null),
  shortBio: Joi.string().max(500).allow('', null),
  biography: Joi.string().allow('', null),
  researchStatement: Joi.string().allow('', null),
  careerSummary: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().allow('', null),
  office: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  orcid: Joi.string().allow('', null),
  profileType: Joi.string().allow('', null),
  visibility: Joi.string().valid('PUBLIC', 'PRIVATE').default('PUBLIC'),
});

export const appointmentSchema = Joi.object({
  title: Joi.string().required(),
  institution: Joi.string().required(),
  faculty: Joi.string().allow('', null),
  department: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),
  isCurrent: Joi.boolean().default(false),
  description: Joi.string().allow('', null),
  displayOrder: Joi.number().default(0),
});

export const educationSchema = Joi.object({
  degree: Joi.string().required(),
  field: Joi.string().required(),
  institution: Joi.string().required(),
  location: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  startDate: Joi.date().allow(null),
  completionDate: Joi.date().allow(null),
  thesisTitle: Joi.string().allow('', null),
  thesisUrl: Joi.string().uri().allow('', null),
  description: Joi.string().allow('', null),
  displayOrder: Joi.number().default(0),
});
