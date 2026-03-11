// File overview: Handles auth HTTP requests and delegates to the auth service layer.

import type { RequestHandler } from 'express';

import authService from '../services/authService';

function getTokenContext(req: Parameters<RequestHandler>[0]) {
  return {
    userAgent: (req.headers['user-agent'] as string) ?? null,
    ipAddress: req.ip ?? null
  };
}

const register: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.register(req.body ?? {}, getTokenContext(req));
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.login(req.body ?? {}, getTokenContext(req));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const refresh: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body ?? {}, getTokenContext(req));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logout: RequestHandler = async (req, res, next) => {
  try {
    await authService.logout(req.body ?? {});
    res.status(200).json({ message: 'Logged out.' });
  } catch (error) {
    next(error);
  }
};

const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.me(req.user!.userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refresh,
  logout,
  me
};
