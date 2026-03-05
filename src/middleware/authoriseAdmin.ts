// File overview: Restricts access to only admin users after authentication.

import type { RequestHandler } from 'express';

import AppError from '../errors/AppError';

const authoriseAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    return next(new AppError(401, 'Authentication required.'));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError(403, 'Admin access required.'));
  }

  next();
};

export default authoriseAdmin;
