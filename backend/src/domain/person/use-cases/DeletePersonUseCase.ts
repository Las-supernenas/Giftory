import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { PersonRepository } from '../repositories/PersonRepository';

export interface DeletePersonUseCaseInput {
  userId: number; // authenticated user
  personId: number;
}

export class DeletePersonUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(input: DeletePersonUseCaseInput): Promise<void> {
    // Checking ownership. If another user's person returns a 404
    const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);

    if (!person) {
      throw new EntityNotFoundError('Person', String(input.personId));
    }

    // Soft delete: the person is kept in the database with deletedAt set
    await this.personRepository.softDelete(person.id);
  }
}
