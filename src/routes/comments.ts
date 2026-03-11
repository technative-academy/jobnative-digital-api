import { Router } from "express";

import commentsController from '../controllers/commentsController';

const router = Router();

// list comments for a company
router.get('/companies/:companyId/comments', commentsController.listCompanyComments);

// create comment for a company
router.post('/companies/:companyId/comments', commentsController.createCompanyComment);

// update a comment
router.patch("/comments/:id", commentsController.updateComment);

// delete a comment
router.delete("/comments/:id", commentsController.deleteComment);

export default router;