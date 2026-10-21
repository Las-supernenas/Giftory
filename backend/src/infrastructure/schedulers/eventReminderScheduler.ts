import cron from 'node-cron';
import { SendEventRemindersUseCase } from '../../domain/event/use-cases/SendEventRemindersUseCase';

export function startEventReminderScheduler(
  sendEventRemindersUseCase: SendEventRemindersUseCase,
): void {
  cron.schedule(
    '0 9 * * *',
    async () => {
      try {
        console.log('Running daily event reminders...');

        await sendEventRemindersUseCase.execute();

        console.log('Daily event reminders completed.');
      } catch (error) {
        console.error('Daily event reminders failed:', error);
      }
    },
    {
      timezone: 'Europe/Madrid',
      noOverlap: true,
    },
  );
}
