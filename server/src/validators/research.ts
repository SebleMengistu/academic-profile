import Joi from 'joi';

export const researchAreaSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  icon: Joi.string().allow('', null),
  displayOrder: Joi.number().default(0),
});

const teamMemberSchema = Joi.object({
  name: Joi.string().required(),
  role: Joi.string()
    .valid(
      'Principal Investigator',
      'Co-Investigator',
      'Researcher',
      'PhD Student',
      'Research Assistant',
      'Industry Partner',
      'External Collaborator'
    )
    .required(),
  affiliation: Joi.string().allow('', null),
});

export const fundedResearchSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  fundingType: Joi.string()
    .valid(
      'Grant',
      'Contract Research',
      'Industry Funding',
      'Government Funding',
      'University Funding',
      'Fellowship',
      'Scholarship',
      'Other'
    )
    .required(),
  funder: Joi.string().required(),
  fundingScheme: Joi.string().allow('', null),
  grantNumber: Joi.string().allow('', null),
  amount: Joi.number().allow(null),
  currency: Joi.string().default('USD').allow('', null),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),
  status: Joi.string().valid('ACTIVE', 'COMPLETED', 'PENDING', 'CANCELLED').default('ACTIVE'),
  principalInvestigator: Joi.string().required(),
  teamMembers: Joi.array().items(teamMemberSchema).default([]),
  researchAreas: Joi.array().items(Joi.string()).default([]),
  externalUrl: Joi.string().uri().allow('', null),
  featured: Joi.boolean().default(false),
  contentStatus: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED').default('DRAFT'),
});
