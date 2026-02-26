// File overview: Maps /api/companies endpoints to company controller methods.

import { Router } from 'express';

import companiesController from '../controllers/companiesController';

const router = Router();

router.get('/', companiesController.listCompanies);
router.get('/:id', companiesController.getCompanyById);
router.post('/', companiesController.createCompany);
router.patch('/:id', companiesController.updateCompany);
router.delete('/:id', companiesController.deleteCompany);

export default router;
