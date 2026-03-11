// File overview: Maps moderation endpoints for company approval workflow.

import { Router } from 'express';

import companiesController from '../controllers/companiesController';
import authenticate from '../middleware/authenticate';
import authoriseAdmin from '../middleware/authoriseAdmin';

const router = Router();

router.use(authenticate);
router.use(authoriseAdmin);

router.get('/', companiesController.listAllCompanies);

router.get('/pending', companiesController.listPendingCompanies);
router.patch('/:id/approve', companiesController.approveCompany);
router.patch('/:id/reject', companiesController.rejectCompany);

export default router;
