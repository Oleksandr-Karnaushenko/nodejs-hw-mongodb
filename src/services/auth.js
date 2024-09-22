import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';

import { UsersCollection } from '../db/models/User.js';
import { FIFTEEN_MINUTES, THIRTY_DAY } from '../constants/index.js';
import { SessionsCollection } from '../db/models/Session.js';

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
  const user = await UsersCollection.findOne({
    email: payload.email,
  });

  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({
    email: payload.email,
  });
  if (!user) throw createHttpError(401, 'Email or password invalid');

  const correctPassword = await bcrypt.compare(payload.password, user.password);
  if (!correctPassword) throw createHttpError(401, 'Email or password invalid');

  await SessionsCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  const userSession = await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });

  return userSession;
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
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

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};
