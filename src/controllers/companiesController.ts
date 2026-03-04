// File overview: Handles company-related HTTP requests and delegates to the service layer.

import type { RequestHandler } from 'express';

import companiesService from '../services/companiesService';

const listCompanies: RequestHandler = async (req, res, next) => {
  try {
    const companies = await companiesService.listCompanies(req.query);
    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

const listAllCompanies: RequestHandler = async (req, res, next) => {
  try {
    const companies = await companiesService.listAllCompanies(req.query);
    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

const getCompanyById: RequestHandler = async (req, res, next) => {
  try {
    const company = await companiesService.getCompanyById(req.params.id);
    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};

const createCompany: RequestHandler = async (req, res, next) => {
  try {
    const company = await companiesService.createCompany(req.body ?? {});
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

const updateCompany: RequestHandler = async (req, res, next) => {
  try {
    const company = await companiesService.updateCompany(req.params.id, req.body ?? {});
    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};

const deleteCompany: RequestHandler = async (req, res, next) => {
  try {
    await companiesService.deleteCompany(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const listPendingCompanies: RequestHandler = async (_req, res, next) => {
  try {
    const companies = await companiesService.listPendingCompanies();
    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

const approveCompany: RequestHandler = async (req, res, next) => {
  try {
    const company = await companiesService.approveCompany(req.params.id, req.body ?? {});
    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};

const rejectCompany: RequestHandler = async (req, res, next) => {
  try {
    const company = await companiesService.rejectCompany(req.params.id);
    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};

export default {
  listCompanies,
  listAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  listPendingCompanies,
  approveCompany,
  rejectCompany
};
