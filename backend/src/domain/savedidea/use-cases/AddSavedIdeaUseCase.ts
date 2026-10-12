import { BusinessConflictError } from '../../errors/BusinessConflictError';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { GiftIdeaRepository } from '../../giftidea/repositories/GiftIdeaRepository';
import { PersonRepository } from '../../person/repositories/PersonRepository';
import { SavedIdeaRepository } from '../repositories/SavedIdeaRepository';
import { SavedIdea } from '../SavedIdea';

export interface AddSavedIdeaUseCaseInput {
  userId: number;
  personId: number;
  giftIdeaId: number;
}

export class AddSavedIdeaUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly savedIdeaRepository: SavedIdeaRepository,
    private readonly giftIdeaRepository: GiftIdeaRepository,
  ) {}
  async execute(input: AddSavedIdeaUseCaseInput): Promise<SavedIdea> {
    const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);
    if (!person) {
      throw new EntityNotFoundError('Person', String(input.personId));
    }
    const giftIdea = await this.giftIdeaRepository.findById(input.giftIdeaId);
    if (!giftIdea) {
      throw new EntityNotFoundError('GiftIdea', String(input.giftIdeaId));
    }
    const existingSavedIdea = await this.savedIdeaRepository.findByPersonIdAndGiftIdeaId(
      input.personId,
      input.giftIdeaId,
    );
    if (existingSavedIdea) {
      throw new BusinessConflictError('GiftIdea is already saved for this Person.');
    }

    return this.savedIdeaRepository.create(input.personId, input.giftIdeaId);
  }
}
