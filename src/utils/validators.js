const { z } = require('zod');

/**
 * Role schema (lowercase for inputs).
 */
const RoleSchema = z.enum(['organizer', 'attendee']);

/**
 * Register input schema.
 */
const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: RoleSchema
});

/**
 * Login input schema.
 */
const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

/**
 * Create event input schema.
 */
const CreateEventInput = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/)
});

/**
 * Update event input schema.
 */
const UpdateEventInput = CreateEventInput.partial();

module.exports = { RegisterInput, LoginInput, CreateEventInput, UpdateEventInput };
