const { getPrisma } = require('../models/prisma-client');

/**
 * List all events with participant count.
 * @returns {Promise<Array<{ id: string, title: string, description: string, date: string, time: string, organizerId: string, participants: number }>>}
 */
async function listEvents() {
  const prisma = getPrisma();
  const events = await prisma.event.findMany({ include: { registrations: true } });
  return events.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date.toISOString().slice(0, 10),
    time: e.time,
    organizerId: e.organizerId,
    participants: e.registrations.length
  }));
}

/**
 * Get event by id with participant emails.
 * @param {string} id
 * @returns {Promise<{ id: string, title: string, description: string, date: string, time: string, organizerId: string, participants: string[] } | null>}
 */
async function getEventById(id) {
  const prisma = getPrisma();
  const e = await prisma.event.findUnique({ where: { id }, include: { registrations: { include: { user: true } } } });
  if (!e) return null;
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date.toISOString().slice(0, 10),
    time: e.time,
    organizerId: e.organizerId,
    participants: e.registrations.map(r => r.user.email)
  };
}

/**
 * Create event.
 * @param {{ title: string, description: string, date: string, time: string, organizerId: string }} input
 * @returns {Promise<{ id: string }>} 
 */
async function createEvent(input) {
  const prisma = getPrisma();
  const date = new Date(input.date + 'T00:00:00.000Z');
  const e = await prisma.event.create({ data: { title: input.title, description: input.description, date, time: input.time, organizerId: input.organizerId } });
  return { id: e.id };
}

/**
 * Update event (organizer only).
 * @param {string} id
 * @param {{ title?: string, description?: string, date?: string, time?: string }} data
 * @param {string} organizerId
 * @returns {Promise<void>}
 */
async function updateEvent(id, data, organizerId) {
  const prisma = getPrisma();
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });
  if (existing.organizerId !== organizerId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  const update = { ...data };
  if (data.date) update.date = new Date(data.date + 'T00:00:00.000Z');
  await prisma.event.update({ where: { id }, data: update });
}

/**
 * Delete event (organizer only).
 * @param {string} id
 * @param {string} organizerId
 * @returns {Promise<void>}
 */
async function deleteEvent(id, organizerId) {
  const prisma = getPrisma();
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });
  if (existing.organizerId !== organizerId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  await prisma.registration.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });
}

/**
 * Register user for event.
 * @param {string} eventId
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function registerForEvent(eventId, userId) {
  const prisma = getPrisma();
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });
  const already = await prisma.registration.findUnique({ where: { eventId_userId: { eventId, userId } } });
  if (already) return;
  await prisma.registration.create({ data: { eventId, userId } });
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent };
