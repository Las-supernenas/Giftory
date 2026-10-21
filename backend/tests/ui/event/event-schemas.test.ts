import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createEventSchema,
  toEventResponse,
  updateEventSchema,
} from '../../../src/ui/event/event-schemas';
import { Event } from '../../../src/domain/event/Event';

// the controllers turn a failed schema into a ValidationError (400) with the first message

test('rejects a repeatsYearly that is not a boolean with a Spanish message', () => {
  const result = createEventSchema.safeParse({
    name: 'Birthday',
    date: '2026-12-15',
    repeatsYearly: 'yes',
  });

  assert.equal(result.success, false);
  assert.equal(
    result.error?.issues[0].message,
    'Indica si el evento se repite cada año (true o false).',
  );
});

test('accepts repeatsYearly true, false or not sent when creating', () => {
  const base = { name: 'Birthday', date: '2026-12-15' };

  assert.equal(createEventSchema.safeParse({ ...base, repeatsYearly: true }).success, true);
  assert.equal(createEventSchema.safeParse({ ...base, repeatsYearly: false }).success, true);
  assert.equal(createEventSchema.safeParse(base).success, true);
});

test('accepts an update that only sends repeatsYearly false', () => {
  const result = updateEventSchema.safeParse({ repeatsYearly: false });

  assert.equal(result.success, true);
});

test('rejects an empty update', () => {
  const result = updateEventSchema.safeParse({});

  assert.equal(result.success, false);
  assert.equal(result.error?.issues[0].message, 'Envía al menos un campo para actualizar.');
});

test('includes repeatsYearly in the event response', () => {
  const event = new Event({
    id: 1,
    personId: 2,
    name: 'Anniversary',
    date: '2015-05-18',
    repeatsYearly: true,
  });

  assert.deepEqual(toEventResponse(event), {
    id: 1,
    name: 'Anniversary',
    date: '2015-05-18',
    repeatsYearly: true,
  });
});
