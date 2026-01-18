const express = require('express');
const { requireAuth, requireRole } = require('../core/auth-middleware');
const { CreateEventInput, UpdateEventInput } = require('../utils/validators');
const { listEvents, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent } = require('../services/event-service');
const { sendRegistrationEmail } = require('../core/email-service');
const { getPrisma } = require('../models/prisma-client');

const router = express.Router();

router.get('/events', requireAuth, async (_req, res, next) => {
  try {
    const events = await listEvents();
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

router.get('/events/:id', requireAuth, async (req, res, next) => {
  try {
    const event = await getEventById(String(req.params.id));
    if (!event) return res.status(404).json({ error: 'Not found' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

router.post('/events', requireAuth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    const parsed = CreateEventInput.parse(req.body);
    const created = await createEvent({ ...parsed, organizerId: req.auth.userId });
    res.status(201).json({ id: created.id });
  } catch (err) {
    next(err);
  }
});

router.put('/events/:id', requireAuth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    const parsed = UpdateEventInput.parse(req.body);
    await updateEvent(String(req.params.id), parsed, req.auth.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.delete('/events/:id', requireAuth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    await deleteEvent(String(req.params.id), req.auth.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post('/events/:id/register', requireAuth, async (req, res, next) => {
  try {
    const eventId = String(req.params.id);
    await registerForEvent(eventId, req.auth.userId);
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (user && event) await sendRegistrationEmail(user.email, { title: event.title, date: event.date.toISOString().slice(0,10), time: event.time });
    res.status(200).json({ registered: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
