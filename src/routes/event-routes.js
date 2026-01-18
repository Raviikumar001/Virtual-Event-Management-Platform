const express = require('express');
const { requireAuth, requireRole } = require('../core/auth-middleware');
const { CreateEventInput, UpdateEventInput } = require('../utils/validators');
const { listEvents, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent, listEventParticipants } = require('../services/event-service');
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
    let emailPreviewUrl;
    let emailProvider;
    let emailError;
    if (user && event) {
      try {
        const result = await sendRegistrationEmail(user.email, { title: event.title, date: event.date.toISOString().slice(0,10), time: event.time });
        emailPreviewUrl = result.previewUrl;
        emailProvider = result.provider;
      } catch (_mailErr) {
        emailError = _mailErr?.message || 'Email send failed';
      }
    }
    const response = { registered: true };
    if (process.env.NODE_ENV !== 'production') {
      if (emailPreviewUrl) response.emailPreviewUrl = emailPreviewUrl;
      if (emailProvider) response.emailProvider = emailProvider;
      if (emailError) response.emailError = emailError;
    }
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/events/:id/participants', requireAuth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    const participants = await listEventParticipants(String(req.params.id), req.auth.userId);
    res.json({ participants });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
