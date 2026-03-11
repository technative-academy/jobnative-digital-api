// File overview: Maps /api/job-roles endpoints to controller methods.

import { Router } from 'express';

import jobRolesController from '../controllers/jobRolesController';
import authenticate from '../middleware/authenticate';
import authoriseAdmin from '../middleware/authoriseAdmin';

const router = Router();

router.get('/', jobRolesController.listJobRoles);
router.patch('/:id', authenticate, authoriseAdmin, jobRolesController.updateJobRole);
router.delete('/:id', authenticate, authoriseAdmin, jobRolesController.deleteJobRole);

export default router;
