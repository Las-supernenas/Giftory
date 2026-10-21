import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { ValidationError } from '../../errors/ValidationError';
import { Event } from '../Event';
import { EventRepository, UpdateEventData } from '../repositories/EventRepository';
import { isValidEventDate } from '../utils/validators';

export interface UpdateEventUseCaseInput {
  userId: number; //authenticated user
  eventId: number;
  name?: string;
  date?: string; //"YYYY-MM-DD"
  repeatsYearly?: boolean;
}

export class UpdateEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(input: UpdateEventUseCaseInput): Promise<Event> {
    //Ownership through the person: another users event returns 404, as if it did not exist
    const event = await this.eventRepository.findByIdAndUserId(input.eventId, input.userId);

    if (!event) {
      throw new EntityNotFoundError('Event', String(input.eventId));
    }

    const data: UpdateEventData = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new ValidationError('El nombre es obligatorio.');
      }
      data.name = name;
    }

    if (input.date !== undefined) {
      if (!isValidEventDate(input.date)) {
        throw new ValidationError('La fecha no es válida.');
      }
      data.date = input.date;
      data.resetReminder = input.date !== event.date;
    }

    if (input.repeatsYearly !== undefined) {
      data.repeatsYearly = input.repeatsYearly;
    }

    return this.eventRepository.update(event.id, data);
  }
}
