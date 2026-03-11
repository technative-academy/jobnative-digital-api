// File overview: Handles user-company state HTTP requests for the personal dashboard.

import type { RequestHandler } from 'express';

import userCompanyStatesService from '../services/userCompanyStatesService';

const listStates: RequestHandler = async (req, res, next) => {
  try {
    const states = await userCompanyStatesService.listByUser(req.user!.userId);
    res.status(200).json(states);
  } catch (error) {
    next(error);
  }
};

const getState: RequestHandler = async (req, res, next) => {
  try {
    const state = await userCompanyStatesService.getByUserAndCompany(
      req.user!.userId,
      req.params.companyId
    );
    res.status(200).json(state);
  } catch (error) {
    next(error);
  }
};

const upsertState: RequestHandler = async (req, res, next) => {
  try {
    const state = await userCompanyStatesService.upsert(
      req.user!.userId,
      req.params.companyId,
      req.body ?? {}
    );
    res.status(200).json(state);
  } catch (error) {
    next(error);
  }
};

const deleteState: RequestHandler = async (req, res, next) => {
  try {
    await userCompanyStatesService.remove(req.user!.userId, req.params.companyId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default {
  listStates,
  getState,
  upsertState,
  deleteState
};
