
import { EventRepository } from '../repositories/EventRepository';
import { EmailService } from '../../services/EmailService';

export class SendEventRemindersUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(today: Date = new Date()): Promise<void> {
    // Calculate the date seven days from today using UTC.
    const reminderDate = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + 7,
      ),
    );

    const date = reminderDate.toISOString().slice(0, 10);

    // Find events occurring on that date without a sent reminder.
    const reminders =
      await this.eventRepository.findPendingRemindersByDate(date);

    // Send one reminder per event.
    for (const reminder of reminders) {
      try {
        await this.emailService.sendEmail({
          to: reminder.userEmail,
          subject: `Giftory: \u00a1El evento de ${reminder.personName} se acerca!`,
          text: `\u00a1Hola, ${reminder.userName}!

        Te recordamos que dentro de 7 d\u00edas tienes un evento importante:

        \u{1F389} Persona: ${reminder.personName}
        \u{1F4C5} Evento: ${reminder.eventName}
        \u{1F4C6} Fecha: ${reminder.eventDate}

        \u00a1No te olvides de preparar un regalo especial!

        Un saludo,
        El equipo de Giftory`,
        });

        // Only mark the reminder as sent after Mailgun accepts it.
        await this.eventRepository.markReminderSent(reminder.eventId);
      } catch (error) {
        console.error(
          `Failed to process reminder for event ${reminder.eventId}:`,
          error,
        );
      }
    }
  }
}
