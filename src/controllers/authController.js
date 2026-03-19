import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

export const registerUser = async (request, response) => {
  const { email, password } = request.body;

  const existUser = await User.findOne({ email });
  if (existUser) {
    throw createHttpError(400, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  const newSession = await createSession(newUser._id);

  setSessionCookies(response, newSession);

  response.status(201).json(newUser);
};

export const loginUser = async (request, response) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  const newSession = await createSession(user._id);

  setSessionCookies(response, newSession);

  response.status(200).json(user);
};

export const logoutUser = async (request, response) => {
  const { sessionId } = request.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  response.clearCookie('sessionId');
  response.clearCookie('accessToken');
  response.clearCookie('refreshToken');

  response.status(204).send();
};

export const refreshUserSession = async (request, response) => {
  const session = await Session.findOne({
    _id: request.cookies.sessionId,
    refreshToken: request.cookies.refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({
    _id: request.cookies.sessionId,
    refreshToken: request.cookies.refreshToken,
  });

  const newSession = await createSession(session.userId);
  setSessionCookies(response, newSession);

  response.status(200).json({ message: 'Session refreshed' });
};
