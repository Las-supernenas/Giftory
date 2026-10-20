import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import type { GiftIdeaRepository } from '../repositories/GiftIdeaRepository';

export class UpdateGiftIdeaImageUseCase {
  constructor(private readonly giftIdeaRepository: GiftIdeaRepository) {}

  async execute(userId: number, giftIdeaId: number, imageFilename: string | null) {
    const giftIdea = await this.giftIdeaRepository.findById(giftIdeaId);
    if (!giftIdea || giftIdea.userId !== userId) {
      throw new EntityNotFoundError('GiftIdea', String(giftIdeaId));
    }

    const updated = await this.giftIdeaRepository.updateImageFilename(
      giftIdeaId,
      imageFilename,
    );

    return { giftIdea: updated, previousImageFilename: giftIdea.imageFilename };
  }
}
