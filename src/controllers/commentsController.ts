import { Request, Response, NextFunction } from "express";
import commentsRepository from "../repositories/commentsRepository";

const listCompanyComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.companyId);
    const comments = await commentsRepository.getByCompanyId(companyId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

const createCompanyComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.companyId);
    const { body, user_id } = req.body;
    const comment = await commentsRepository.create({ companyId, userId: user_id, body });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { body, user_id } = req.body;
    const comment = await commentsRepository.update({ id, userId: user_id, body });
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    res.json(comment);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { user_id } = req.body;
    await commentsRepository.remove(id, user_id);
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