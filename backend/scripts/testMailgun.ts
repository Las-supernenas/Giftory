import 'dotenv/config';
import { MailgunEmailService } from '../src/infrastructure/services/MailgunEmailService';

async function main(): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    throw new Error('Missing Mailgun environment variables');
  }

  const emailService = new MailgunEmailService(apiKey, domain);

  await emailService.sendEmail({
    to: 'giftorykc@gmail.com',
    subject: 'Giftory TypeScript test',
    text: 'This email was sent from our Giftory backend using Mailgun!',
  });

  console.log('Email accepted by Mailgun!');
}

main().catch((error: unknown) => {
  console.error('Email test failed:', error);
  process.exitCode = 1;
});