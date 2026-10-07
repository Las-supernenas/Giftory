import { GiftIdea } from '../GiftIdea';
import { GiftIdeaRepository } from '../repositories/GiftIdeaRepository';
import { Interest } from '../../shared/Interest';
import { ValidationError } from '../../errors/ValidationError';

export interface CreateGiftIdeaUseCaseInput {
  userId: number;
  name: string;
  price: number;
  interests: Interest[];
}

export class CreateGiftIdeaUseCase {
  constructor(private readonly giftIdeaRepository: GiftIdeaRepository) {}

  async execute(input: CreateGiftIdeaUseCaseInput): Promise<GiftIdea> {
    const name = input.name.trim();

    if (!name) {
      throw new ValidationError('Name is required.');
    }

    if (!Number.isFinite(input.price) || input.price < 0) {
      throw new ValidationError('Price must be a non-negative number.');
    }

    return this.giftIdeaRepository.create({
      userId: input.userId,
      name,
      price: input.price,
      interests: [...new Set(input.interests)],
    });
  }
}
