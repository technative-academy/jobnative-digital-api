// File overview: Maps /api/events endpoints to event controller methods.

import { Router } from 'express';

import eventsController from '../controllers/eventsController';

const router = Router();

router.get('/', eventsController.listEvents);
router.get('/:id', eventsController.getEventById);
router.post('/', eventsController.createEvent);
router.patch('/:id', eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

export default router;