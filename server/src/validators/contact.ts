import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().max(200).allow('', null),
  message: Joi.string().min(10).max(2000).required(),
});

export const contactStatusSchema = Joi.object({
  status: Joi.string()
    .valid('New', 'Read', 'Replied', 'Archived', 'Spam')
    .required(),
});
