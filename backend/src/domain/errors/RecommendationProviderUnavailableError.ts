import { DomainError } from './DomainError';

export class RecommendationProviderUnavailableError extends DomainError {
  readonly name = 'RecommendationProviderUnavailableError';

  constructor() {
    super('The recommendation provider is unavailable.');
  }
}
