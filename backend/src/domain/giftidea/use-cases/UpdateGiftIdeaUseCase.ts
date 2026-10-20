import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import type { Interest } from '../../shared/Interest';
import { GiftIdea } from '../GiftIdea';
import { GiftIdeaRepository } from '../repositories/GiftIdeaRepository';
import { ValidationError } from '../../errors/ValidationError';

export interface UpdateGiftIdeaUseCaseInput {
  userId: number;
  giftIdeaId: number;
  name: string;
  price: number;
  interests: Interest[];
  description?: string | null;
  productUrl?: string | null;
}

export class UpdateGiftIdeaUseCase {
  constructor(private readonly giftIdeaRepository: GiftIdeaRepository) {}

  async execute(input: UpdateGiftIdeaUseCaseInput): Promise<GiftIdea> {
    const giftIdea = await this.giftIdeaRepository.findById(input.giftIdeaId);

    if (!giftIdea || giftIdea.userId !== input.userId) {
      throw new EntityNotFoundError('GiftIdea', String(input.giftIdeaId));
    }

    const name = input.name.trim();

    const description =
      input.description === undefined ? undefined : input.description?.trim() || null;
    const productUrl =
      input.productUrl === undefined ? undefined : input.productUrl?.trim() || null;

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

    return this.giftIdeaRepository.update(giftIdea.id, {
      name: name,
      price: input.price,
      interests: [...new Set(input.interests)],
      description,
      productUrl,
    });
  }
}
