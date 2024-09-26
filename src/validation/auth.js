import Joi from 'joi';
import { emailRegexp } from '../constants/user.js';

export const requestResetEmailSchema = Joi.object({
  email: Joi.string().required().pattern(emailRegexp),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});
