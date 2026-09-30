import { DomainError } from './DomainError';

//The user is authenticated but not allowed to perform this action. Mapped to 403
export class ForbiddenOperationError extends DomainError {
  readonly name = 'ForbiddenOperationError';

  constructor(message: string) {
    super(message);
  }
}
