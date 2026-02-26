// File overview: Maps moderation endpoints for company approval workflow.

import { Router } from 'express';

import companiesController from '../controllers/companiesController';

const router = Router();

router.get('/pending', companiesController.listPendingCompanies);
router.patch('/:id/approve', companiesController.approveCompany);
router.patch('/:id/reject', companiesController.rejectCompany);

export default router;
