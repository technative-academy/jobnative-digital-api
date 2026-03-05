// File overview: Handles /users HTTP requests and delegates business logic to the service layer.

import type { RequestHandler } from 'express';

import usersService from '../services/usersService';

const listUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await usersService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export default {
  listUsers
};
