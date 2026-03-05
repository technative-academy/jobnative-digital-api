// File overview: Verifies JWT access tokens and attaches the authenticated user to the request.

import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import AppError from '../errors/AppError';

export interface AuthPayload {
  userId: number;
  role: 'user' | 'admin';
}


function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required.');
  }
  return secret;
}

const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required.'));
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token.'));
  }
};

export default authenticate;
