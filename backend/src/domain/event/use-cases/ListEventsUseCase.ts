import { EntityNotFoundError } from "../../errors/EntityNotFoundError";
import { PersonRepository } from "../../person/repositories/PersonRepository";
import { Event } from "../Event";
import { EventRepository } from "../repositories/EventRepository";

export interface ListEventsUseCaseInput {
    userId: number //authenticated user
    personId: number;
}

export class ListEventsUseCase {
    constructor(
        private readonly eventRepository: EventRepository,
        private readonly personRepository: PersonRepository,
    ) {}

    async execute(input: ListEventsUseCaseInput): Promise<Event[]> {
        //Ownership through the person: another user's person (or a deleted one) returns 404
        const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);

        if(!person) {
            throw new EntityNotFoundError('Person', String(input.personId));
        }

        return this.eventRepository.findAllByPersonId(person.id);
    }
}