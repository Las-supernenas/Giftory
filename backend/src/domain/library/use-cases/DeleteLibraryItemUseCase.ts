import { LibraryItemRepository } from '../repositories/LibraryItemRepository';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError';

export interface DeleteLibraryItemUseCaseInput {
  userId: number;
  libraryItemId: number;
}

export class DeleteLibraryItemUseCase {
  constructor(private readonly libraryItemRepository: LibraryItemRepository) {}
  async execute(input: DeleteLibraryItemUseCaseInput): Promise<void> {
    const deleted = await this.libraryItemRepository.deleteByIdAndUserId(
      input.libraryItemId,
      input.userId,
    );
    if (!deleted) {
      throw new EntityNotFoundError('LibraryItem', String(input.libraryItemId));
    }
  }
}
