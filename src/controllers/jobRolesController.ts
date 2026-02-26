// File overview: Handles job role listing requests used by frontend filter UIs.

import type { RequestHandler } from 'express';

import jobRolesService from '../services/jobRolesService';

const listJobRoles: RequestHandler = async (_req, res, next) => {
  try {
    const jobRoles = await jobRolesService.listJobRoles();
    res.status(200).json(jobRoles);
  } catch (error) {
    next(error);
  }
};

const updateJobRole: RequestHandler = async (req, res, next) => {
  try {
    const jobRole = await jobRolesService.updateJobRole(req.params.id, req.body ?? {});
    res.status(200).json(jobRole);
  } catch (error) {
    next(error);
  }
};

const deleteJobRole: RequestHandler = async (req, res, next) => {
  try {
    await jobRolesService.deleteJobRole(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default {
  listJobRoles,
  updateJobRole,
  deleteJobRole
};
