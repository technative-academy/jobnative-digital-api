// File overview: Handles event-related HTTP requests and delegates to the service layer.

import type { RequestHandler } from 'express';

import eventsService from '../services/eventsService';

const listEvents: RequestHandler = async (req, res, next) => {
    try {
        const events = await eventsService.listEvents(req.query)
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
}

const listAllEvents: RequestHandler = async (req, res, next) => {
    try {
        const events = await eventsService.listAllEvents(req.query)
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
}

const getEventById: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventsService.getEventById(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

const createEvent: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventsService.createEvent(req.body ?? {});
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

const updateEvent: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventsService.updateEvent(req.params.id, req.body ?? {});
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    await eventsService.deleteEvent(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const listPendingEvents: RequestHandler = async (_req, res, next) => {
  try {
    const events = await eventsService.listPendingEvents();
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

const approveEvent: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventsService.approveEvent(req.params.id, req.body ?? {});
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

const rejectEvent: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventsService.rejectEvent(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export default {
  listEvents,
  listAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  listPendingEvents,
  approveEvent,
  rejectEvent
}