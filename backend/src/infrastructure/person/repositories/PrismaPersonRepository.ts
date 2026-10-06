import { prisma } from '../../prisma-client';
import { Person as PrismaPerson } from '@prisma/client';
import { Person } from '../../../domain/person/Person';
import {
  CreatePersonData,
  PersonRepository,
  UpdatePersonData,
} from '../../../domain/person/repositories/PersonRepository';

//Adapter: implements the PersonRepository port with Prisma
//Every read filters by deletedAr: null (soft-deleted people never leave this class)

export class PrismaPersonRepository implements PersonRepository {
  private readonly prisma = prisma;

  async create(data: CreatePersonData): Promise<Person> {
    const prismaPerson = await this.prisma.person.create({
      data: {
        userId: data.userId,
        name: data.name,
        interests: data.interests,
      },
    });

    return this.restore(prismaPerson);
  }

  async findAllByUserId(userId: number): Promise<Person[]> {
    const prismaPeople = await this.prisma.person.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: 'asc' },
    });

    return prismaPeople.map((prismaPerson) => this.restore(prismaPerson));
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Person | null> {
    //findFirst (not findUnique) because we filter by more than the id
    const prismaPerson = await this.prisma.person.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!prismaPerson) {
      return null;
    }

    return this.restore(prismaPerson);
  }

  async update(id: number, data: UpdatePersonData): Promise<Person> {
    //Fields that are undefined are not changed by Prisma
    const prismaPerson = await this.prisma.person.update({
      where: { id },
      data: {
        name: data.name,
        interests: data.interests,
      },
    });
    return this.restore(prismaPerson);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.person.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Converts a Prisma row into a domain entity (without deletedAt)
  private restore(prismaPerson: PrismaPerson): Person {
    return new Person({
      id: prismaPerson.id,
      userId: prismaPerson.userId,
      name: prismaPerson.name,
      interests: prismaPerson.interests,
    });
  }
}
