
import { Email, EmailService } from '../../domain/services/EmailService';

export class MailgunEmailService implements EmailService {
  constructor(
    private readonly apiKey: string,
    private readonly domain: string,
    private readonly apiBaseUrl = 'https://api.mailgun.net',
  ) {}

  async sendEmail(email: Email): Promise<void> {
    const formData = new FormData();

    formData.append('from', `Giftory <postmaster@${this.domain}>`);
    formData.append('to', email.to);
    formData.append('subject', email.subject);
    formData.append('text', email.text);

    const credentials = Buffer.from(`api:${this.apiKey}`).toString('base64');

    const response = await fetch(
      `${this.apiBaseUrl}/v3/${this.domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorMessage = await response.text();

      throw new Error(
        `Mailgun failed to send email (${response.status}): ${errorMessage}`,
      );
    }
  }
}
