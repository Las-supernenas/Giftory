import { DomainError } from './DomainError';

// The requested entity does not exist. Mapped to 404
export class EntityNotFoundError extends DomainError {
  readonly name = 'EntityNotFoundError';

  constructor(entity: string, id: string) {
    super(`entity ${entity} not found with id ${id}`);
  }
}
