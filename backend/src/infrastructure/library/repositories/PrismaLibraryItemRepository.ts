import { LibraryItem } from '../../../domain/library/LibraryItem';
import type { LibraryItemRepository } from '../../../domain/library/repositories/LibraryItemRepository';
import { prisma } from '../../prisma-client';
import { GiftIdea } from '../../../domain/giftidea/GiftIdea';

export class PrismaLibraryItemRepository implements LibraryItemRepository {
  private readonly prisma = prisma;
  async findAllByUserId(userId: number): Promise<LibraryItem[]> {
    const prismaLibrary = await this.prisma.libraryItem.findMany({
      where: { userId },
      include: { giftIdea: true },
    });

    return prismaLibrary.map((row) => {
      const giftIdea = new GiftIdea({
        id: row.giftIdea.id,
        name: row.giftIdea.name,
        price: row.giftIdea.price.toNumber(),
        interests: row.giftIdea.interests,
        userId: row.giftIdea.userId,
        deletedAt: row.giftIdea.deletedAt,
      });
      return new LibraryItem({
        id: row.id,
        userId: row.userId,
        giftIdeaId: row.giftIdeaId,
        giftIdea,
      });
    });
  }
}
