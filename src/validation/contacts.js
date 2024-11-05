import Joi from 'joi';
import { contactTypeList } from '../constants/contacts.js';
import { emailRegexp } from '../constants/user.js';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Contact name should be a string',
    'string.min': 'Contact name should have at least {#limit} characters',
    'string.max': 'Contact name should have at most {#limit} characters',
    'any.required': 'Contact name is required',
  }),
  phoneNumber: Joi.number().required().messages({
    'number.base': 'Contact phone number should be a number',
    'any.required': 'Contact phone number is required',
  }),
  email: Joi.string().min(3).max(20).pattern(emailRegexp).messages({
    'string.base': 'Contact email should be a string',
    'string.min': 'Contact email should have at least {#limit} characters',
    'string.max': 'Contact email should have at most {#limit} characters',
    'string.pattern': 'Contact email should be a email',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .valid(...contactTypeList)
    .required(),
  photo: Joi.string(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Contact name should be a string',
    'string.min': 'Contact name should have at least {#limit} characters',
    'string.max': 'Contact name should have at most {#limit} characters',
    'any.required': 'Contact name is required',
  }),
  phoneNumber: Joi.number().integer().messages({
    'number.base': 'Contact phone number should be a number',
    'any.required': 'Contact phone number is required',
  }),
  email: Joi.string().pattern(emailRegexp).min(3).max(30).messages({
    'string.base': 'Contact email should be a string',
    'string.min': 'Contact email should have at least {#limit} characters',
    'string.max': 'Contact email should have at most {#limit} characters',
    'string.email': 'Contact email should be a email',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid(...contactTypeList),
  photo: Joi.string(),
});
