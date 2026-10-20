import { DomainError } from './DomainError';

/** The recommendation provider did not respond before the configured timeout. */
export class RecommendationProviderTimeoutError extends DomainError {
  readonly name = 'RecommendationProviderTimeoutError';

  constructor() {
    super('The recommendation provider request timed out.');
  }
}
