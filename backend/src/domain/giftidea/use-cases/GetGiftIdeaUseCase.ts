import { GiftIdea } from '../GiftIdea';
import { GiftIdeaRepository } from '../repositories/GiftIdeaRepository';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError';

export interface GetGiftIdeaUseCaseInput {
  id: number;
}

export class GetGiftIdeaUseCase {
  constructor(private readonly giftIdeaRepository: GiftIdeaRepository) {}

  async execute(input: GetGiftIdeaUseCaseInput): Promise<GiftIdea> {
    const giftIdeaById = await this.giftIdeaRepository.findById(input.id);

    if (!giftIdeaById) {
      throw new EntityNotFoundError('GiftIdea', String(input.id));
    }

    return giftIdeaById;
  }
}
