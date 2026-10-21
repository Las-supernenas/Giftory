import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { ValidationError } from '../../errors/ValidationError';
import { PersonRepository } from '../../person/repositories/PersonRepository';
import { Event } from '../Event';
import { EventRepository } from '../repositories/EventRepository';
import { isValidEventDate } from '../utils/validators';

export interface CreateEventUseCaseInput {
  userId: number; // authenticated user
  personId: number;
  name: string;
  date: string; // "YYYY-MM-DD"
  repeatsYearly?: boolean; // not sent: one-time event
}

export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(input: CreateEventUseCaseInput): Promise<Event> {
    //Ownership through the person: you can only add events to you own people
    const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);

    if (!person) {
      throw new EntityNotFoundError('Person', String(input.personId));
    }

    const name = input.name.trim();

    if (!name) {
      throw new ValidationError('El nombre es obligatorio.');
    }

    if (!isValidEventDate(input.date)) {
      throw new ValidationError('La fecha no es válida.');
    }

    return this.eventRepository.create({
      personId: person.id,
      name,
      date: input.date,
      repeatsYearly: input.repeatsYearly ?? false,
    });
  }
}
