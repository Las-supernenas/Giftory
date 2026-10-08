import type { LibraryItem } from '../LibraryItem';

export interface LibraryItemRepository {
  findAllByUserId(userId: number): Promise<LibraryItem[]>;
  findByUserIdAndGiftIdeaId(userId: number, giftIdeaId: number): Promise<LibraryItem | null>;

  create(userId: number, giftIdeaId: number): Promise<LibraryItem>;
}
