// File overview: Contains auth business logic for registration, login, token refresh, and logout.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

import AppError from '../errors/AppError';
import usersRepository from '../repositories/usersRepository';
import authRefreshTokensRepository from '../repositories/authRefreshTokensRepository';
import type { AuthPayload } from '../middleware/authenticate';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required.');
  }
  return secret;
}

function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

interface RegisterPayload {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

interface LoginPayload {
  email?: unknown;
  password?: unknown;
}

interface RefreshPayload {
  refreshToken?: unknown;
}

interface TokenContext {
  userAgent: string | null;
  ipAddress: string | null;
}

async function register(payload: RegisterPayload, context: TokenContext) {
  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    throw new AppError(400, '"name" is required.');
  }

  if (!payload.email || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    throw new AppError(400, '"email" is required.');
  }

  if (!payload.password || typeof payload.password !== 'string' || payload.password.length < 8) {
    throw new AppError(400, '"password" must be at least 8 characters.');
  }

  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();

  const existing = await usersRepository.getByEmail(email);
  if (existing) {
    throw new AppError(409, 'A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const user = await usersRepository.create({ name, email, passwordHash });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await authRefreshTokensRepository.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
    expiresAt
  });

  return { user, accessToken, refreshToken };
}

async function login(payload: LoginPayload, context: TokenContext) {
  if (!payload.email || typeof payload.email !== 'string') {
    throw new AppError(400, '"email" is required.');
  }

  if (!payload.password || typeof payload.password !== 'string') {
    throw new AppError(400, '"password" is required.');
  }

  const email = payload.email.trim().toLowerCase();
  const user = await usersRepository.getByEmail(email);

  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await authRefreshTokensRepository.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
    expiresAt
  });

  const { passwordHash: _, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
}

async function refresh(payload: RefreshPayload, context: TokenContext) {
  if (!payload.refreshToken || typeof payload.refreshToken !== 'string') {
    throw new AppError(400, '"refreshToken" is required.');
  }

  const tokenHash = hashToken(payload.refreshToken);
  const existing = await authRefreshTokensRepository.findByTokenHash(tokenHash);

  if (!existing) {
    throw new AppError(401, 'Invalid or expired refresh token.');
  }

  // Revoke the old token (rotation)
  await authRefreshTokensRepository.revokeByTokenHash(tokenHash);

  const user = await usersRepository.getById(existing.userId);
  if (!user) {
    throw new AppError(401, 'User not found.');
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await authRefreshTokensRepository.create({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
    expiresAt
  });

  return { user, accessToken, refreshToken: newRefreshToken };
}

async function logout(payload: RefreshPayload) {
  if (!payload.refreshToken || typeof payload.refreshToken !== 'string') {
    throw new AppError(400, '"refreshToken" is required.');
  }

  const tokenHash = hashToken(payload.refreshToken);
  await authRefreshTokensRepository.revokeByTokenHash(tokenHash);
}

async function me(userId: number) {
  const user = await usersRepository.getById(userId);
  if (!user) {
    throw new AppError(404, 'User not found.');
  }
  return user;
}

export default {
  register,
  login,
  refresh,
  logout,
  me
};
