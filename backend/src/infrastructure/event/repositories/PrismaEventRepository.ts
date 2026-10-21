import { prisma } from '../../prisma-client';
import { Event as PrismaEvent } from '@prisma/client';
import { Event } from '../../../domain/event/Event';
import {
  CreateEventData,
  EventRepository,
  UpdateEventData, EventReminder
} from '../../../domain/event/repositories/EventRepository';

//Adapter: implements the EventRepository port with Prisma
//The domain uses "YYYY-MM-DD" strings, the database stores a DATE column
// conversrions are done in UTC so the day never shifts because of the timezone

export class PrismaEventRepository implements EventRepository {
  private readonly prisma = prisma;

  async create(data: CreateEventData): Promise<Event> {
    const prismaEvent = await this.prisma.event.create({
      data: {
        personId: data.personId,
        name: data.name,
        date: this.toDatabaseDate(data.date),
      },
    });
    return this.restore(prismaEvent);
  }

  async findAllByPersonId(personId: number): Promise<Event[]> {
    const prismaEvents = await this.prisma.event.findMany({
      where: { personId },
      orderBy: { date: 'asc' },
    });
    return prismaEvents.map((prismaEvent) => this.restore(prismaEvent));
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Event | null> {
    // Ownership through the person: the event's person must belong to this user and not be deleted
    const prismaEvent = await this.prisma.event.findFirst({
      where: { id, person: { userId, deletedAt: null } },
    });

    if (!prismaEvent) {
      return null;
    }

    return this.restore(prismaEvent);
  }

  async update(id: number, data: UpdateEventData): Promise<Event> {
    // Fields that are undefined are not changed by Prisma
    const prismaEvent = await this.prisma.event.update({
      where: { id },
      data: {
        name: data.name,
        date: data.date === undefined ? undefined : this.toDatabaseDate(data.date),
        reminderSentAt: data.resetReminder ? null : undefined,
      },
    });

    return this.restore(prismaEvent);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }

  async findPendingRemindersByDate(
    date: string,
  ): Promise<EventReminder[]> {
    const prismaEvents = await this.prisma.event.findMany({
      where: {
        date: this.toDatabaseDate(date),
        reminderSentAt: null,
        person: {
          deletedAt: null,
        },
      },
      include: {
        person: {
          include: {
            user: true,
          },
        },
      },
    });

    return prismaEvents.map((prismaEvent) => ({
      eventId: prismaEvent.id,
      eventName: prismaEvent.name,
      eventDate: this.toDomainDate(prismaEvent.date),
      personName: prismaEvent.person.name,
      userName: prismaEvent.person.user.name,
      userEmail: prismaEvent.person.user.email,
    }));
  }

  async markReminderSent(eventId: number): Promise<void> {
    await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        reminderSentAt: new Date(),
      },
    });
  }

  // "2026-10-23" -> Date at 00:00 UTC
  private toDatabaseDate(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }

  // Date at 00:00 UTC -> "2026-10-23"
  private toDomainDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  // Converts a Prisma row into a domain entity
  private restore(prismaEvent: PrismaEvent): Event {
    return new Event({
      id: prismaEvent.id,
      personId: prismaEvent.personId,
      name: prismaEvent.name,
      date: this.toDomainDate(prismaEvent.date),
    });
  }
}
