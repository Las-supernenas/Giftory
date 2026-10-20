import type { GiftIdea as PrismaGiftIdea } from '@prisma/client';
import { GiftIdea } from '../../../domain/giftidea/GiftIdea';
import type {
  CreateGiftIdeaData,
  GiftIdeaRepository,
  UpdateGiftIdeaData,
} from '../../../domain/giftidea/repositories/GiftIdeaRepository';
import { prisma } from '../../prisma-client';

// Adapter: implements the GiftIdeaRepository port with Prisma.
export class PrismaGiftIdeaRepository implements GiftIdeaRepository {
  private readonly prisma = prisma;

  async create(data: CreateGiftIdeaData): Promise<GiftIdea> {
    const prismaGiftIdea = await this.prisma.giftIdea.create({
      data: {
        userId: data.userId,
        name: data.name,
        price: data.price,
        interests: data.interests,
        description: data.description,
        productUrl: data.productUrl,
        imageFilename: data.imageFilename,
      },
    });

    return this.restore(prismaGiftIdea);
  }

  async update(id: number, data: UpdateGiftIdeaData): Promise<GiftIdea> {
    const row = await this.prisma.giftIdea.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        interests: data.interests,
        description: data.description,
        productUrl: data.productUrl,
        imageFilename: data.imageFilename,
      },
    });

    return this.restore(row);
  }

  async updateImageFilename(id: number, imageFilename: string | null): Promise<GiftIdea> {
    const row = await this.prisma.giftIdea.update({
      where: { id },
      data: { imageFilename },
    });

    return this.restore(row);
  }

  async findAll(): Promise<GiftIdea[]> {
    const prismaGiftIdeas = await this.prisma.giftIdea.findMany({
      where: { deletedAt: null },
    });

    return prismaGiftIdeas.map((giftIdea) => this.restore(giftIdea));
  }

  async findById(id: number): Promise<GiftIdea | null> {
    const prismaGiftIdea = await this.prisma.giftIdea.findFirst({
      where: { id, deletedAt: null },
    });

    if (!prismaGiftIdea) {
      return null;
    }

    return this.restore(prismaGiftIdea);
  }

  private restore(prismaGiftIdea: PrismaGiftIdea): GiftIdea {
    return new GiftIdea({
      id: prismaGiftIdea.id,
      name: prismaGiftIdea.name,
      price: prismaGiftIdea.price.toNumber(),
      userId: prismaGiftIdea.userId,
      interests: prismaGiftIdea.interests,
      description: prismaGiftIdea.description,
      productUrl: prismaGiftIdea.productUrl,
      imageFilename: prismaGiftIdea.imageFilename,
      deletedAt: prismaGiftIdea.deletedAt,
    });
  }
}
