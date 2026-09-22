import Joi from 'joi';

const authorSchema = Joi.object({
  name: Joi.string().required(),
  affiliation: Joi.string().allow('', null),
  orcid: Joi.string().allow('', null),
  isCorresponding: Joi.boolean().default(false),
  order: Joi.number().default(0),
});

export const publicationSchema = Joi.object({
  title: Joi.string().required(),
  abstract: Joi.string().allow('', null),
  publicationType: Joi.string()
    .valid(
      'Journal Article',
      'Conference Paper',
      'Book',
      'Book Chapter',
      'Technical Report',
      'Patent',
      'Dataset',
      'Software',
      'Thesis',
      'Poster',
      'Other'
    )
    .required(),
  authors: Joi.array().items(authorSchema).default([]),
  journal: Joi.string().allow('', null),
  conference: Joi.string().allow('', null),
  publisher: Joi.string().allow('', null),
  volume: Joi.string().allow('', null),
  issue: Joi.string().allow('', null),
  pages: Joi.string().allow('', null),
  year: Joi.number().integer().min(1900).max(2100).required(),
  publicationDate: Joi.date().allow(null),
  doi: Joi.string().allow('', null),
  isbn: Joi.string().allow('', null),
  issn: Joi.string().allow('', null),
  keywords: Joi.array().items(Joi.string()).default([]),
  citation: Joi.string().allow('', null),
  externalUrl: Joi.string().uri().allow('', null),
  researchAreas: Joi.array().items(Joi.string()).default([]),
  featured: Joi.boolean().default(false),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED').default('DRAFT'),
  visibility: Joi.string().valid('PUBLIC', 'PRIVATE').default('PUBLIC'),
});

export const publicationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().allow('', null),
  year: Joi.number().integer().allow(null),
  type: Joi.string().allow('', null),
  area: Joi.string().allow('', null),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').allow(null),
  featured: Joi.boolean().allow(null),
});
