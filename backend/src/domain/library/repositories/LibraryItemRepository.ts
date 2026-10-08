import type { LibraryItem } from '../LibraryItem';

export interface LibraryItemRepository {
  findAllByUserId(userId: number): Promise<LibraryItem[]>;
}
