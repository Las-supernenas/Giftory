import { DomainError } from './DomainError';

//The input data is invalid or breaks a business rule (e.g. empty name, negative price). Mapped to 400.
export class ValidationError extends DomainError {
  readonly name = 'ValidationError';

  constructor(message: string) {
    super(message);
  }
}
