import type { Interest } from '../../shared/Interest';

/** The gift data sent to the AI service. Names and prices are verified and
 * returned from the database by the use case, never trusted from the AI.
 */
export interface RecommendationGiftIdea {
  id: number;
  name: string;
  price: number;
  description: string | null;
}

/** Input from the use case to the AI provider adapter. */
export interface RecommendationAIInput {
  interests: Interest[];
  ageRange?: string;
  occasion?: string;
  additionalInfo?: string;
  giftIdeas: RecommendationGiftIdea[];
}

/** Normalized AI output before it is enriched with database values. */
export interface AIRecommendation {
  giftIdeaId: number;
  matchScore: number;
  reason: string;
}

/** Domain port implemented by the OpenRouter infrastructure adapter. */
export interface GiftRecommendationService {
  recommend(input: RecommendationAIInput): Promise<AIRecommendation[]>;
}
