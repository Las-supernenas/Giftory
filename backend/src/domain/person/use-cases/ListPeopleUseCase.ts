import { Person } from '../Person';
import { PersonRepository } from '../repositories/PersonRepository';

export interface ListPeopleUseCaseInput {
  userId: number; //authenticated user
}

export class ListPeopleUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  // Only the people of the authenticated user, never others user's people
  async execute(input: ListPeopleUseCaseInput): Promise<Person[]> {
    return this.personRepository.findAllByUserId(input.userId);
  }
}
