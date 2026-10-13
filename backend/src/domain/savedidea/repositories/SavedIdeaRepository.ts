import type { SavedIdea } from '../SavedIdea';

export interface SavedIdeaRepository {
  findAllByPersonId(personId: number): Promise<SavedIdea[]>;
  findByPersonIdAndGiftIdeaId(personId: number, giftIdeaId: number): Promise<SavedIdea | null>;
  deleteByIdAndPersonId(savedIdeaId: number, personId: number): Promise<boolean>;
  create(personId: number, giftIdeaId: number): Promise<SavedIdea>;
}
