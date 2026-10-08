import { GiftIdeaRepository } from '../../giftidea/repositories/GiftIdeaRepository';
import { LibraryItem } from '../LibraryItem';
import { LibraryItemRepository } from '../repositories/LibraryItemRepository';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { BusinessConflictError } from '../../errors/BusinessConflictError';

export interface AddLibraryItemUseCaseInput {
  userId: number;
  giftIdeaId: number;
}

export class AddLibraryItemUseCase {
  constructor(
    private readonly libraryRepository: LibraryItemRepository,
    private readonly giftIdeaRepository: GiftIdeaRepository,
  ) {}
  async execute(input: AddLibraryItemUseCaseInput): Promise<LibraryItem> {
    const giftIdea = await this.giftIdeaRepository.findById(input.giftIdeaId);
    if (!giftIdea) {
      throw new EntityNotFoundError('GiftIdea', String(input.giftIdeaId));
    }
    const existingItem = await this.libraryRepository.findByUserIdAndGiftIdeaId(
      input.userId,
      input.giftIdeaId,
    );
    if (existingItem) {
      throw new BusinessConflictError('GiftIdea is already in the library.');
    }
    return this.libraryRepository.create(input.userId, input.giftIdeaId);
  }
}
