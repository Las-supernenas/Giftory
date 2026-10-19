
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CreateEventUseCase } from '../../../src/domain/event/use-cases/CreateEventUseCase';
import {
  CreateEventData,
  EventRepository,
} from '../../../src/domain/event/repositories/EventRepository';
import { Person } from '../../../src/domain/person/Person';
import { PersonRepository } from '../../../src/domain/person/repositories/PersonRepository';
import { EntityNotFoundError } from '../../../src/domain/errors/EntityNotFoundError';
import { ValidationError } from '../../../src/domain/errors/ValidationError';

function createFakePerson(userId = 1, personId = 10): Person {
  return new Person({
    id: personId,
    userId,
    name: 'Test Person',
    interests: [],
  });
}

function createFakeRepositories(person: Person | null = createFakePerson()) {
  let createdData: CreateEventData | undefined;
  let createCalls = 0;

  const eventRepository = {
    create: async (data: CreateEventData) => {
      createCalls++;
      createdData = data;

      return {
        id: 100,
        ...data,
      };
    },
  } as EventRepository;

  const personRepository = {
    findByIdAndUserId: async (personId: number, userId: number) => {
      if (
        person &&
        person.id === personId &&
        person.userId === userId
      ) {
        return person;
      }

      return null;
    },
  } as PersonRepository;

  return {
    eventRepository,
    personRepository,
    getCreatedData: () => createdData,
    getCreateCalls: () => createCalls,
  };
}

test('creates an event for a person owned by the authenticated user', async () => {
  const fake = createFakeRepositories();

  const useCase = new CreateEventUseCase(
    fake.eventRepository,
    fake.personRepository,
  );

  const result = await useCase.execute({
    userId: 1,
    personId: 10,
    name: '  Birthday  ',
    date: '2026-12-15',
  });

  assert.deepEqual(fake.getCreatedData(), {
    personId: 10,
    name: 'Birthday',
    date: '2026-12-15',
  });

  assert.equal(fake.getCreateCalls(), 1);
  assert.equal(result.id, 100);
});

test('rejects an event with an empty name', async () => {
  const fake = createFakeRepositories();

  const useCase = new CreateEventUseCase(
    fake.eventRepository,
    fake.personRepository,
  );

  await assert.rejects(
    useCase.execute({
      userId: 1,
      personId: 10,
      name: '   ',
      date: '2026-12-15',
    }),
    ValidationError,
  );

  assert.equal(fake.getCreateCalls(), 0);
});

test('rejects an event with an invalid date', async () => {
  const fake = createFakeRepositories();

  const useCase = new CreateEventUseCase(
    fake.eventRepository,
    fake.personRepository,
  );

  await assert.rejects(
    useCase.execute({
      userId: 1,
      personId: 10,
      name: 'Birthday',
      date: 'invalid-date',
    }),
    ValidationError,
  );

  assert.equal(fake.getCreateCalls(), 0);
});

test('rejects creating an event for a person not owned by the user', async () => {
  const fake = createFakeRepositories(createFakePerson(1, 10));

  const useCase = new CreateEventUseCase(
    fake.eventRepository,
    fake.personRepository,
  );

  await assert.rejects(
    useCase.execute({
      userId: 2,
      personId: 10,
      name: 'Birthday',
      date: '2026-12-15',
    }),
    EntityNotFoundError,
  );

  assert.equal(fake.getCreateCalls(), 0);
});


