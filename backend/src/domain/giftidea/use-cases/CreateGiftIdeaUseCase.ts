import { GiftIdea } from '../GiftIdea';
import { GiftIdeaRepository } from '../repositories/GiftIdeaRepository';
import { Interest } from '../../shared/Interest';
import { ValidationError } from '../../errors/ValidationError';

export interface CreateGiftIdeaUseCaseInput {
  userId: number;
  name: string;
  price: number;
  interests: Interest[];
  description?: string | null;
  productUrl?: string | null;
}

export class CreateGiftIdeaUseCase {
  constructor(private readonly giftIdeaRepository: GiftIdeaRepository) {}

  async execute(input: CreateGiftIdeaUseCaseInput): Promise<GiftIdea> {
    const name = input.name.trim();
    const description = input.description?.trim() || null;
    const productUrl = input.productUrl?.trim() || null;

    if (!name) {
      throw new ValidationError('Name is required.');
    }

    if (!Number.isFinite(input.price) || input.price < 0) {
      throw new ValidationError('Price must be a non-negative number.');
    }

    if (productUrl) {
      try {
        const url = new URL(productUrl);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          throw new Error('Unsupported protocol');
        }
      } catch {
        throw new ValidationError('Product URL must be a valid http or https URL.');
      }
    }

    return this.giftIdeaRepository.create({
      userId: input.userId,
      name,
      price: input.price,
      interests: [...new Set(input.interests)],
      description,
      productUrl,
    });
  }
}
