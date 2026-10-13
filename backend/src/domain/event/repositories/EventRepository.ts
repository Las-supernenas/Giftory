import { Event } from "../Event";

export interface CreateEventData {
    personId: number;
    name: string;
    date: string; //"YYYY-MM-DD"
}

export interface UpdateEventData {
    name?: string;
    date?: string;
}

export interface EventRepository {
    create(data:CreateEventData): Promise<Event>;
    //All events of a person, ordered by date
    findAllByPersonId(personId: number): Promise<Event[]>;
    //Returns null if the event does not exist, or its person is deleted or belongs to another user
    findByIdAndUserId(id: number, userId: number): Promise<Event | null>;
    update(id: number, data: UpdateEventData): Promise<Event>;
    //Hard delete: the row is removed from the database
    delete(id: number): Promise<void>;
}
