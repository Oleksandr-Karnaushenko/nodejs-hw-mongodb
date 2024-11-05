import Joi from 'joi';
import { emailRegexp } from '../constants/user.js';

export const registerUserShema = Joi.object({
  name: Joi.string().required().min(3).max(30),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().required(),
  role: Joi.string().valid('admin', 'user'),
});

export const loginUserShema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().required(),
});
