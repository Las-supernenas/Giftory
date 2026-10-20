import type { GiftIdea } from '../GiftIdea';
import type { Interest } from '../../shared/Interest';

export interface CreateGiftIdeaData {
  userId: number;
  name: string;
  price: number;
  interests: Interest[];
  description?: string | null;
  productUrl?: string | null;
  imageFilename?: string | null;
}

export interface UpdateGiftIdeaData {
  name: string;
  price: number;
  interests: Interest[];
  description?: string | null;
  productUrl?: string | null;
  imageFilename?: string | null;
}

export interface GiftIdeaRepository {
  findById(id: number): Promise<GiftIdea | null>;
  findAll(): Promise<GiftIdea[]>;
  create(data: CreateGiftIdeaData): Promise<GiftIdea>;
  update(id: number, data: UpdateGiftIdeaData): Promise<GiftIdea>;
  updateImageFilename(id: number, imageFilename: string | null): Promise<GiftIdea>;
}
