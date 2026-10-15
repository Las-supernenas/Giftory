import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { PersonRepository } from '../../person/repositories/PersonRepository';
import { SavedIdeaRepository } from '../repositories/SavedIdeaRepository';
import { SavedIdea } from '../SavedIdea';

export interface UpdateSavedIdeaPrivateNoteUseCaseInput {
  userId: number;
  personId: number;
  savedIdeaId: number;
  privateNote: string | null;
}

export class UpdateSavedIdeaPrivateNoteUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly savedIdeaRepository: SavedIdeaRepository,
  ) {}
  async execute(input: UpdateSavedIdeaPrivateNoteUseCaseInput): Promise<SavedIdea> {
    const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);

    if (!person) {
      throw new EntityNotFoundError('Person', String(input.personId));
    }
    const savedIdea = await this.savedIdeaRepository.updatePrivateNoteByIdAndPersonId(
      input.savedIdeaId,
      input.personId,
      input.privateNote,
    );

    if (!savedIdea) {
      throw new EntityNotFoundError('SavedIdea', String(input.savedIdeaId));
    }

    return savedIdea;
  }
}
