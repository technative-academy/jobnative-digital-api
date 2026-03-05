// File overview: Maps /api/user-company-states endpoints to controller methods (all auth-protected).

import { Router } from 'express';

import authenticate from '../middleware/authenticate';
import userCompanyStatesController from '../controllers/userCompanyStatesController';

const router = Router();

router.use(authenticate);

router.get('/', userCompanyStatesController.listStates);
router.get('/:companyId', userCompanyStatesController.getState);
router.put('/:companyId', userCompanyStatesController.upsertState);
router.delete('/:companyId', userCompanyStatesController.deleteState);

export default router;
