import type { RecommendationRequest } from '../recommendation-types';

/** Controller input: authenticated user, URL person ID, and validated body. */
export interface GetGiftRecommendationsUseCaseInput
  extends RecommendationRequest {
  userId: number;
  personId: number;
}
