// File overview: Handles technology listing requests used by frontend filter UIs.

import type { RequestHandler } from 'express';

import technologiesService from '../services/technologiesService';

const listTechnologies: RequestHandler = async (_req, res, next) => {
  try {
    const technologies = await technologiesService.listTechnologies();
    res.status(200).json(technologies);
  } catch (error) {
    next(error);
  }
};

const updateTechnology: RequestHandler = async (req, res, next) => {
  try {
    const technology = await technologiesService.updateTechnology(req.params.id, req.body ?? {});
    res.status(200).json(technology);
  } catch (error) {
    next(error);
  }
};

const deleteTechnology: RequestHandler = async (req, res, next) => {
  try {
    await technologiesService.deleteTechnology(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default {
  listTechnologies,
  updateTechnology,
  deleteTechnology
};
