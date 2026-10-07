import { GiftIdea } from '../GiftIdea';
import { GiftIdeaRepository } from '../repositories/GiftIdeaRepository';

export class ListGiftIdeaUseCase {
  constructor(private readonly giftIdeaRepository: GiftIdeaRepository) {}

  async execute(): Promise<GiftIdea[]> {
    return this.giftIdeaRepository.findAll();
  }
}
