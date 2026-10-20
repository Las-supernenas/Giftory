import { DomainError } from './DomainError';

/** The provider returned malformed or contract-invalid recommendation data. */
export class RecommendationProviderResponseError extends DomainError {
  readonly name = 'RecommendationProviderResponseError';

  constructor() {
    super('The recommendation provider returned an invalid response.');
  }
}
