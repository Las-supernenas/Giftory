import { LibraryItem } from '../LibraryItem';
import { LibraryItemRepository } from '../repositories/LibraryItemRepository';

export interface ListLibraryItemsUseCaseInput {
  userId: number;
}

export class ListLibraryItemsUseCase {
  constructor(private readonly libraryRepository: LibraryItemRepository) {}

  async execute(input: ListLibraryItemsUseCaseInput): Promise<LibraryItem[]> {
    return this.libraryRepository.findAllByUserId(input.userId);
  }
}
