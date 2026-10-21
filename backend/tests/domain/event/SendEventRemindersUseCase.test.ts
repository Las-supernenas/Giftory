
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SendEventRemindersUseCase } from '../../../src/domain/event/use-cases/SendEventRemindersUseCase';
import {
  EventRepository,
  EventReminder,
} from '../../../src/domain/event/repositories/EventRepository';
import { Email, EmailService } from '../../../src/domain/services/EmailService';

// Only the repository methods used by this use case need fake implementations.
function createFakeEventRepository(reminders: EventReminder[]) {
  const requestedDates: string[] = [];
  const markedEventIds: number[] = [];

  const repository = {
    async findPendingRemindersByDate(date: string): Promise<EventReminder[]> {
      requestedDates.push(date);
      return reminders;
    },

    async markReminderSent(eventId: number): Promise<void> {
      markedEventIds.push(eventId);
    },
  } as EventRepository;

  return { repository, requestedDates, markedEventIds };
}

function createFakeEmailService(failForAddresses: string[] = []) {
  const sentEmails: Email[] = [];

  const emailService: EmailService = {
    async sendEmail(email: Email): Promise<void> {
      if (failForAddresses.includes(email.to)) {
        throw new Error('Simulated email failure');
      }

      sentEmails.push(email);
    },
  };

  return { emailService, sentEmails };
}

const reminder: EventReminder = {
  eventId: 1,
  eventName: 'Birthday',
  eventDate: '2026-10-28',
  personName: 'Ana',
  userName: 'Julia',
  userEmail: 'test@example.com',
};

test('sends a reminder and marks the event as sent', async () => {
  const { repository, requestedDates, markedEventIds } =
    createFakeEventRepository([reminder]);
  const { emailService, sentEmails } = createFakeEmailService();

  const useCase = new SendEventRemindersUseCase(repository, emailService);

  await useCase.execute(new Date('2026-10-21T12:00:00Z'));

  assert.deepEqual(requestedDates, ['2026-10-28']);
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].to, 'test@example.com');
  assert.match(sentEmails[0].subject, /Ana/);
  assert.match(sentEmails[0].text, /Birthday/);
  assert.deepEqual(markedEventIds, [1]);
});

test('does nothing when no reminders are pending', async () => {
  const { repository, markedEventIds } = createFakeEventRepository([]);
  const { emailService, sentEmails } = createFakeEmailService();

  const useCase = new SendEventRemindersUseCase(repository, emailService);

  await useCase.execute(new Date('2026-10-21T12:00:00Z'));

  assert.equal(sentEmails.length, 0);
  assert.deepEqual(markedEventIds, []);
});

test('does not mark a reminder as sent when email sending fails', async () => {
  const { repository, markedEventIds } =
    createFakeEventRepository([reminder]);
  const { emailService, sentEmails } =
    createFakeEmailService(['test@example.com']);

  const useCase = new SendEventRemindersUseCase(repository, emailService);

  // The use case catches the error internally, so execute() resolves.
  await useCase.execute(new Date('2026-10-21T12:00:00Z'));

  assert.equal(sentEmails.length, 0);
  assert.deepEqual(markedEventIds, []);
});

test('continues processing reminders after one email fails', async () => {
  const secondReminder: EventReminder = {
    ...reminder,
    eventId: 2,
    personName: 'Carlos',
    userEmail: 'success@example.com',
  };

  const { repository, markedEventIds } =
    createFakeEventRepository([reminder, secondReminder]);
  const { emailService, sentEmails } =
    createFakeEmailService(['test@example.com']);

  const useCase = new SendEventRemindersUseCase(repository, emailService);

  await useCase.execute(new Date('2026-10-21T12:00:00Z'));

  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].to, 'success@example.com');
  assert.deepEqual(markedEventIds, [2]);
});
