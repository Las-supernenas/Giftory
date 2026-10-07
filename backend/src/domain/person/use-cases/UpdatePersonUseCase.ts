import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { ValidationError } from '../../errors/ValidationError';
import { Interest } from '../../shared/Interest';
import { Person } from '../Person';
import { PersonRepository, UpdatePersonData } from '../repositories/PersonRepository';

export interface UpdatePersonUseCaseInput {
  userId: number; //authenticated user
  personId: number;
  name?: string;
  interests?: Interest[];
}

export class UpdatePersonUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(input: UpdatePersonUseCaseInput): Promise<Person> {
    //Ownership: only finds the person if it belongs to this user and its not deleted.
    //Another users person returns 404, as if it did not exist.
    const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);

    if (!person) {
      throw new EntityNotFoundError('Person', String(input.personId));
    }

    const data: UpdatePersonData = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new ValidationError('Name is required.');
      }
      data.name = name;
    }

    if (input.interests !== undefined) {
      data.interests = [...new Set(input.interests)];
    }

    return this.personRepository.update(person.id, data);
  }
}
