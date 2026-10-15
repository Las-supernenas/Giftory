import { SavedIdeaRepository } from '../../../domain/savedidea/repositories/SavedIdeaRepository';
import { SavedIdea } from '../../../domain/savedidea/SavedIdea';
import { prisma } from '../../prisma-client';
import { GiftIdea } from '../../../domain/giftidea/GiftIdea';
import { Prisma } from '@prisma/client';
import { BusinessConflictError } from '../../../domain/errors/BusinessConflictError';

export class PrismaSavedIdeaRepository implements SavedIdeaRepository {
  private readonly prisma = prisma;
  async updatePrivateNoteByIdAndPersonId(
    savedIdeaId: number,
    personId: number,
    privateNote: string | null,
  ): Promise<SavedIdea | null> {
    try {
      const row = await this.prisma.savedIdea.update({
        where: { id: savedIdeaId, personId },
        data: { privateNote },
        include: { giftIdea: true },
      });
      const giftIdea = new GiftIdea({
        id: row.giftIdea.id,
        name: row.giftIdea.name,
        price: row.giftIdea.price.toNumber(),
        interests: row.giftIdea.interests,
        userId: row.giftIdea.userId,
        deletedAt: row.giftIdea.deletedAt,
      });
      return new SavedIdea({
        id: row.id,
        personId: row.personId,
        giftIdeaId: row.giftIdeaId,
        giftIdea,
        privateNote: row.privateNote,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
  async deleteByIdAndPersonId(savedIdeaId: number, personId: number): Promise<boolean> {
    const result = await this.prisma.savedIdea.deleteMany({ where: { id: savedIdeaId, personId } });
    return result.count > 0;
  }
  async findAllByPersonId(personId: number): Promise<SavedIdea[]> {
    const rows = await this.prisma.savedIdea.findMany({
      where: { personId },
      include: { giftIdea: true },
    });
    return rows.map((row) => {
      const giftIdea = new GiftIdea({
        id: row.giftIdea.id,
        name: row.giftIdea.name,
        price: row.giftIdea.price.toNumber(),
        interests: row.giftIdea.interests,
        userId: row.giftIdea.userId,
        deletedAt: row.giftIdea.deletedAt,
      });

      return new SavedIdea({
        id: row.id,
        personId: row.personId,
        giftIdeaId: row.giftIdeaId,
        giftIdea,
        privateNote: row.privateNote,
      });
    });
  }
  async findByPersonIdAndGiftIdeaId(
    personId: number,
    giftIdeaId: number,
  ): Promise<SavedIdea | null> {
    const row = await this.prisma.savedIdea.findFirst({
      where: { personId, giftIdeaId },
      include: { giftIdea: true },
    });
    if (!row) {
      return null;
    }
    const giftIdea = new GiftIdea({
      id: row.giftIdea.id,
      name: row.giftIdea.name,
      price: row.giftIdea.price.toNumber(),
      interests: row.giftIdea.interests,
      userId: row.giftIdea.userId,
      deletedAt: row.giftIdea.deletedAt,
    });

    return new SavedIdea({
      id: row.id,
      personId: row.personId,
      giftIdeaId: row.giftIdeaId,
      giftIdea,
      privateNote: row.privateNote,
    });
  }

  async create(personId: number, giftIdeaId: number): Promise<SavedIdea> {
    try {
      const row = await this.prisma.savedIdea.create({
        data: { personId, giftIdeaId },
        include: { giftIdea: true },
      });
      const giftIdea = new GiftIdea({
        id: row.giftIdea.id,
        name: row.giftIdea.name,
        price: row.giftIdea.price.toNumber(),
        interests: row.giftIdea.interests,
        userId: row.giftIdea.userId,
        deletedAt: row.giftIdea.deletedAt,
      });

      return new SavedIdea({
        id: row.id,
        personId: row.personId,
        giftIdeaId: row.giftIdeaId,
        giftIdea,
        privateNote: row.privateNote,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BusinessConflictError('GiftIdea is already saved for this Person.');
      }
      throw error;
    }
  }
}
