// File overview: Maps /api/technologies endpoints to controller methods.

import { Router } from 'express';

import technologiesController from '../controllers/technologiesController';
import authenticate from '../middleware/authenticate';
import authoriseAdmin from '../middleware/authoriseAdmin';

const router = Router();

router.get('/', technologiesController.listTechnologies);
router.patch('/:id', authenticate, authoriseAdmin, technologiesController.updateTechnology);
router.delete('/:id', authenticate, authoriseAdmin, technologiesController.deleteTechnology);

export default router;
