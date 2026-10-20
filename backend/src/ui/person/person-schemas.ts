import { z } from 'zod';
import { INTERESTS } from '../../domain/shared/Interest';
import { Person } from '../../domain/person/Person';

// Zod schemas for the People endpoints
// rules shared by create and update are defined once and reused

// Name: text, trimmed and in between 1-100 characters
const nameSchema = z
  .string({ error: 'Name is required.' })
  .trim()
  .min(1, 'Name is required.')
  .max(100, 'Name must have at most 100 characters.');

//Interests: a list where every value must be one of the domain INTERESTS
const interestsSchema = z.array(z.enum(INTERESTS, { error: 'Invalid interest.' }), {
  error: 'Interests must be a list.',
});

//POST /api/people: CREATE: name is required, interest are optional.
export const createPersonSchema = z.object({
  name: nameSchema,
  interests: interestsSchema.optional(),
});

//PATCH /api/people/:id  UPDATE: both fields are optional (partial update),
export const updatePersonSchema = z
  .object({
    name: nameSchema.optional(),
    interests: interestsSchema.optional(),
  }) //at least one of them must be sent
  .refine((data) => data.name !== undefined || data.interests !== undefined, {
    error: 'Send at least one field to update.',
  });

// :id from the URL arrives as text: convert it to positive integer
export const personIdSchema = z.coerce
  .number({ error: 'Invalid person id.' })
  .int('Invali person id.')
  .positive('Invalid person id.');

// POST /api/people/:id/recommendations: every preference is optional
export const recommendationRequestSchema = z.object({
  budget: z
    .number({ error: 'El presupuesto debe ser un número.' })
    .positive('El presupuesto debe ser mayor que 0.')
    .optional(),
  ageRange: z.string({ error: 'El rango de edad debe ser un texto.' }).trim().optional(),
  occasion: z.string({ error: 'La ocasión debe ser un texto.' }).trim().optional(),
  additionalInfo: z
    .string({ error: 'La información adicional debe ser un texto.' })
    .trim()
    .max(1000, 'La información adicional puede tener como máximo 1000 caracteres.')
    .optional(),
});

// Shape of a person in a API response
//userId is not returned

export const toPersonResponse = (person: Person) => ({
  id: person.id,
  name: person.name,
  interests: person.interests,
  savedIdeasCount: person.savedIdeasCount,
});
