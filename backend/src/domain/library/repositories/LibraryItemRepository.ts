import type { LibraryItem } from '../LibraryItem';

export interface LibraryItemRepository {
  findAllByUserId(userId: number): Promise<LibraryItem[]>;
  findByUserIdAndGiftIdeaId(userId: number, giftIdeaId: number): Promise<LibraryItem | null>;
  deleteByIdAndUserId(id: number, userId: number): Promise<boolean>;

  create(userId: number, giftIdeaId: number): Promise<LibraryItem>;
}
