import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

type ValidateTarget = 'body' | 'query' | 'params';

export const validate =
  (schema: Joi.ObjectSchema, target: ValidateTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      res.status(422).json({ message: 'Validation error', errors: messages });
      return;
    }

    req[target] = value;
    next();
  };
