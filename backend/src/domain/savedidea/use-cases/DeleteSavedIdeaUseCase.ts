import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { PersonRepository } from '../../person/repositories/PersonRepository';
import { SavedIdeaRepository } from '../repositories/SavedIdeaRepository';

export interface DeleteSavedIdeaUseCaseInput {
  userId: number;
  personId: number;
  savedIdeaId: number;
}

export class DeleteSavedIdeaUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly savedIdeaRepository: SavedIdeaRepository,
  ) {}
  async execute(input: DeleteSavedIdeaUseCaseInput): Promise<void> {
    const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);
    if (!person) {
      throw new EntityNotFoundError('Person', String(input.personId));
    }
    const deleted = await this.savedIdeaRepository.deleteByIdAndPersonId(
      input.savedIdeaId,
      input.personId,
    );
    if (!deleted) {
      throw new EntityNotFoundError('SavedIdea', String(input.savedIdeaId));
    }
  }
}
