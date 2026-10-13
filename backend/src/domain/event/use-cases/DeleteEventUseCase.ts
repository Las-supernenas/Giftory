import { EntityNotFoundError } from "../../errors/EntityNotFoundError";
import { EventRepository } from "../repositories/EventRepository";

export interface DeleteEventUseCaseInput {
    userId: number; //authenticated user
    eventId: number;
}

export class DeleteEventUseCase {
    constructor(private readonly eventRepository: EventRepository) {}

    async execute(input: DeleteEventUseCaseInput): Promise<void> {
        //Ownership, another users event returns 404
        const event = await this.eventRepository.findByIdAndUserId(input.eventId, input.userId);

        if (!event) {
            throw new EntityNotFoundError('Event', String(input.eventId));
        }

        //Hard delete: events are removed from the database
        await this.eventRepository.delete(event.id);
    }
}