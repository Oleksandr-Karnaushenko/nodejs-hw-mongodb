import jwt from 'jsonwebtoken';

import env from './env.js';
import createHttpError from 'http-errors';

const jwtSecret = env('JWT_SECRET');

export const createJwtSecret = (payload) =>
  jwt.sign(payload, jwtSecret, { expiresIn: '5m' });

export const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, jwtSecret);
    return { data: payload };
  } catch (error) {
    if (error instanceof Error)
      throw createHttpError(401, 'Token is expired or invalid.');
  }
};
