import { z } from 'zod';
import { Event } from '../../domain/event/Event';

// Zod schemas for the Event endpoints
// rules shared by create and update are defined once and reused

// Name: text, trimmed and in between 1-100 characters (same rules as a person's name)
const nameSchema = z
  .string({ error: 'El nombre es obligatorio.' })
  .trim()
  .min(1, 'El nombre es obligatorio.')
  .max(100, 'El nombre debe tener un máximo de 100 caracteres.');

// Date: a real calendar day in "YYYY-MM-DD" format (e.g. 2026-02-30 is rejected).
// Past dates are allowed.
const dateSchema = z.iso.date({ error: 'La fecha debe ser una fecha válida en formato YYYY-MM-DD.' });

// POST /api/people/:personId/events: name and date are required
export const createEventSchema = z.object({
  name: nameSchema,
  date: dateSchema,
});

// PATCH /api/events/:id: both fields are optional (partial update)
export const updateEventSchema = z
  .object({
    name: nameSchema.optional(),
    date: dateSchema.optional(),
  }) // at least one of them must be sent
  .refine((data) => data.name !== undefined || data.date !== undefined, {
    error: 'Envía al menos un campo para actualizar.',
  });

// :id from the URL arrives as text: convert it to a positive integer
export const eventIdSchema = z.coerce
  .number({ error: 'ID de evento no válido.' })
  .int('ID de evento no válido.')
  .positive('ID de evento no válido.');

// Shape of an event in an API response
// personId is not returned: events are always listed per person
export const toEventResponse = (event: Event) => ({
  id: event.id,
  name: event.name,
  date: event.date,
});
