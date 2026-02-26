// File overview: Maps /api/technologies endpoints to controller methods.

import { Router } from 'express';

import technologiesController from '../controllers/technologiesController';

const router = Router();

router.get('/', technologiesController.listTechnologies);
router.patch('/:id', technologiesController.updateTechnology);
router.delete('/:id', technologiesController.deleteTechnology);

export default router;
