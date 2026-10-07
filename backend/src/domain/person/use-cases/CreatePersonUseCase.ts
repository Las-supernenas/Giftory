import { ValidationError } from '../../errors/ValidationError';
import { Interest } from '../../shared/Interest';
import { Person } from '../Person';
import { PersonRepository } from '../repositories/PersonRepository';

export interface CreatePersonUseCaseInput {
  userId: number; //authenticated user, owner of the new person
  name: string;
  interests?: Interest[];
}

export class CreatePersonUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(input: CreatePersonUseCaseInput): Promise<Person> {
    const name = input.name.trim();

    if (!name) {
      throw new ValidationError('Name is required.');
    }

    return this.personRepository.create({
      userId: input.userId,
      name,
      // remove duplicated interests
      interests: [...new Set(input.interests ?? [])],
      // if there's no interests give me a empty [], if there is interests, make a set so theres no duplicates
      // and the result of that, make it a new []
    });
  }
}
