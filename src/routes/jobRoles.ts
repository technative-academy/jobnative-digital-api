// File overview: Maps /api/job-roles endpoints to controller methods.

import { Router } from 'express';

import jobRolesController from '../controllers/jobRolesController';

const router = Router();

router.get('/', jobRolesController.listJobRoles);
router.patch('/:id', jobRolesController.updateJobRole);
router.delete('/:id', jobRolesController.deleteJobRole);

export default router;
