import { PersonRepository } from '../../person/repositories/PersonRepository';
import { SavedIdea } from '../SavedIdea';
import { SavedIdeaRepository } from '../repositories/SavedIdeaRepository';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError';

export interface ListSavedIdeasUseCaseInput {
  userId: number;
  personId: number;
}

export class ListSavedIdeasUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly savedIdeaRepository: SavedIdeaRepository,
  ) {}

  async execute(input: ListSavedIdeasUseCaseInput): Promise<SavedIdea[]> {
    const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);
    if (!person) {
      throw new EntityNotFoundError('Person', String(input.personId));
    }
    return this.savedIdeaRepository.findAllByPersonId(input.personId);
  }
}
