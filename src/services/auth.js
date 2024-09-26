import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomBytes } from 'crypto';

import env from '../utils/env.js';
import { SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { FIFTEEN_MINUTES, THIRTY_DAY } from '../constants/index.js';

import { UserCollection } from '../db/models/Users.js';
import { SessionCollection } from '../db/models/Session.js';

import { createJwtSecret, verifyToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/sendMail.js';

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + THIRTY_DAY);

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    accessTokenValidUntil: accessTokenValidUntil,
    refreshTokenValidUntil: refreshTokenValidUntil,
  };
};

export const registerUser = async (payload) => {
  const user = await UserCollection.findOne({
    email: payload.email,
  });

  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const data = await UserCollection.create({
    ...payload,
    password: encryptedPassword,
  });

  delete data._doc.password;

  return data;
};

export const loginUser = async (payload) => {
  const user = await UserCollection.findOne({
    email: payload.email,
  });
  if (!user) throw createHttpError(401, 'Email or password invalid');

  const correctPassword = await bcrypt.compare(payload.password, user.password);
  if (!correctPassword) throw createHttpError(401, 'Email or password invalid');

  await SessionCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  const userSession = await SessionCollection.create({
    userId: user._id,
    ...newSession,
  });

  return userSession;
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await SessionCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const requestResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, ' User not found');
  }

  const resetToken = createJwtSecret({ email });

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const resetPasswordTemplateSource = await fs.readFile(
    resetPasswordTemplatePath,
    'utf-8',
  );

  const template = handlebars.compile(resetPasswordTemplateSource);
  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: env(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  const entries = verifyToken(payload.token);

  const user = await UserCollection.findOne({
    email: entries.data.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UserCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );

  await SessionCollection.deleteOne({ userId: user._id });
};
