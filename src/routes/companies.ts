// File overview: Maps /api/companies endpoints to company controller methods.

import { Router } from 'express';

import companiesController from '../controllers/companiesController';
import authenticate from '../middleware/authenticate';
import authoriseAdmin from '../middleware/authoriseAdmin';

const router = Router();

router.get('/', companiesController.listCompanies);
router.get('/:id', companiesController.getCompanyById);
router.post('/', authenticate, companiesController.createCompany);
router.patch('/:id', authenticate, authoriseAdmin, companiesController.updateCompany);
router.delete('/:id', authenticate, authoriseAdmin, companiesController.deleteCompany);

export default router;
