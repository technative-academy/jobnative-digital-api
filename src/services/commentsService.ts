// File overview:  Handles comment-related business logic before interacting with the repository.

import commentsRepository from '../repositories/commentsRepository';

interface CreateCommentInput {
  companyId: number;
  userId: number;
  body: string;
}

interface UpdateCommentInput {
  id: number;
  userId: number;
  body: string;
}

async function listCompanyComments(companyId: number) {
  if (!Number.isInteger(companyId)) {
    throw new Error('Invalid company id');
  }
  return commentsRepository.getByCompanyId(companyId);
}

async function createCompanyComment({ companyId, userId, body }:  CreateCommentInput) {
  if (!body || body.trim().length === 0) {
    throw new Error('Comment body cannot be empty');
  }
  return commentsRepository.create({ companyId, userId, body });
}

async function updateComment({ id, userId, body }: UpdateCommentInput) {
  if (!body || body.trim().length === 0) {
    throw new Error('Comment body cannot be empty');
  }
  return commentsRepository.update({ id, userId, body });
}

async function deleteComment(id: number, userId: number) {
  return commentsRepository.remove(id, userId);
}

export default {
  listCompanyComments,
  createCompanyComment,
  updateComment,
  deleteComment
};