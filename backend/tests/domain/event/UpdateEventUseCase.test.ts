
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { UpdateEventUseCase } from '../../../src/domain/event/use-cases/UpdateEventUseCase';
import {
  EventRepository,
  UpdateEventData,
} from '../../../src/domain/event/repositories/EventRepository';
import { Event } from '../../../src/domain/event/Event';

const existingEvent: Event = {
  id: 1,
  name: 'Birthday',
  date: '2026-10-27',
  personId: 2,
};

function createFakeRepository(event: Event | null = existingEvent) {
  const updates: UpdateEventData[] = [];

  const repository = {
    async findByIdAndUserId(): Promise<Event | null> {
      return event;
    },

    async update(_id: number, data: UpdateEventData): Promise<Event> {
      updates.push(data);

      if (!event) {
        throw new Error('Event not found');
      }

      return {
        ...event,
        ...data,
      };
    },
  } as EventRepository;

  return { repository, updates };
}

test('resets reminder when event date changes', async () => {
  const { repository, updates } = createFakeRepository();
  const useCase = new UpdateEventUseCase(repository);

  await useCase.execute({
    userId: 1,
    eventId: 1,
    date: '2026-11-15',
  });

  assert.equal(updates.length, 1);
  assert.equal(updates[0].date, '2026-11-15');
  assert.equal(updates[0].resetReminder, true);
});

test('preserves reminder when only the name changes', async () => {
  const { repository, updates } = createFakeRepository();
  const useCase = new UpdateEventUseCase(repository);

  await useCase.execute({
    userId: 1,
    eventId: 1,
    name: 'Updated Birthday',
  });

  assert.equal(updates.length, 1);
  assert.equal(updates[0].name, 'Updated Birthday');
  assert.equal(updates[0].resetReminder, undefined);
});

test('preserves reminder when the date stays the same', async () => {
  const { repository, updates } = createFakeRepository();
  const useCase = new UpdateEventUseCase(repository);

  await useCase.execute({
    userId: 1,
    eventId: 1,
    date: '2026-10-27',
  });

  assert.equal(updates.length, 1);
  assert.equal(updates[0].resetReminder, false);
});

test('rejects an invalid event date', async () => {
  const { repository, updates } = createFakeRepository();
  const useCase = new UpdateEventUseCase(repository);

  await assert.rejects(
    useCase.execute({
      userId: 1,
      eventId: 1,
      date: 'invalid-date',
    }),
  );

  assert.equal(updates.length, 0);
});

test('rejects updates to an event the user cannot access', async () => {
  const { repository, updates } = createFakeRepository(null);
  const useCase = new UpdateEventUseCase(repository);

  await assert.rejects(
    useCase.execute({
      userId: 999,
      eventId: 1,
      date: '2026-11-15',
    }),
  );

  assert.equal(updates.length, 0);
});
