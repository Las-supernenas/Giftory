
import 'dotenv/config';

import { PrismaEventRepository } from '../src/infrastructure/event/repositories/PrismaEventRepository';
import { MailgunEmailService } from '../src/infrastructure/services/MailgunEmailService';
import { SendEventRemindersUseCase } from '../src/domain/event/use-cases/SendEventRemindersUseCase';

async function main(): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    throw new Error('Missing Mailgun environment variables');
  }

  const eventRepository = new PrismaEventRepository();
  const emailService = new MailgunEmailService(apiKey, domain);

  const useCase = new SendEventRemindersUseCase(
    eventRepository,
    emailService,
  );

  console.log('Executing event reminders...');

  await useCase.execute();

  console.log('Reminder execution finished.');
}

main().catch((error: unknown) => {
  console.error('Manual reminder test failed:', error);
  process.exitCode = 1;
});
