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
        description: row.giftIdea.description,
        productUrl: row.giftIdea.productUrl,
        imageFilename: row.giftIdea.imageFilename,
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
  async findByUserIdAndGiftIdeaId(userId: number, giftIdeaId: number): Promise<LibraryItem | null> {
    const row = await this.prisma.libraryItem.findFirst({
      where: { userId, giftIdeaId },
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
      description: row.giftIdea.description,
      productUrl: row.giftIdea.productUrl,
      imageFilename: row.giftIdea.imageFilename,
      userId: row.giftIdea.userId,
      deletedAt: row.giftIdea.deletedAt,
    });
    return new LibraryItem({
      id: row.id,
      userId: row.userId,
      giftIdeaId: row.giftIdeaId,
      giftIdea,
    });
  }

  async create(userId: number, giftIdeaId: number): Promise<LibraryItem> {
    const row = await this.prisma.libraryItem.create({
      data: { userId, giftIdeaId },
      include: { giftIdea: true },
    });
    const giftIdea = new GiftIdea({
      id: row.giftIdea.id,
      name: row.giftIdea.name,
      price: row.giftIdea.price.toNumber(),
      interests: row.giftIdea.interests,
      description: row.giftIdea.description,
      productUrl: row.giftIdea.productUrl,
      imageFilename: row.giftIdea.imageFilename,
      userId: row.giftIdea.userId,
      deletedAt: row.giftIdea.deletedAt,
    });
    return new LibraryItem({
      id: row.id,
      userId: row.userId,
      giftIdeaId: row.giftIdeaId,
      giftIdea,
    });
  }

  async deleteByIdAndUserId(id: number, userId: number): Promise<boolean> {
    const result = await this.prisma.libraryItem.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
