// File overview: Maps /api/users endpoints to controller methods in the MVC request flow.

import { Router } from 'express';

import usersController from '../controllers/usersController';
import authenticate from '../middleware/authenticate';
import authoriseAdmin from '../middleware/authoriseAdmin';

const router = Router();

router.use(authenticate);
router.use(authoriseAdmin);

router.get('/', usersController.listUsers);

export default router;
