import { Request, Response, NextFunction } from "express";
import commentsService from '../services/commentsService';

const listCompanyComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.companyId);
    res.json([]);
  } catch (err) {
    next(err);
  }
};

const createCompanyComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.companyId);
    const { body } = req.body;

    res.status(201).json({companyId, body });
  } catch (err) {
    next(err);
  }
};

const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    res.json({ id });
  } catch (err) {
    next(err);
  }
}

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export default {
  listCompanyComments,
  createCompanyComment,
  updateComment,
  deleteComment,
};