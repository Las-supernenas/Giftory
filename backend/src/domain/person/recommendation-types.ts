/** Optional preferences accepted by POST /api/people/:id/recommendations. */
export interface RecommendationRequest {
  budget?: number;
  ageRange?: string;
  occasion?: string;
  additionalInfo?: string;
}

/** Enriched recommendation returned by the backend API. */
export interface GiftRecommendation {
  giftIdeaId: number;
  name: string;
  price: number;
  imageFilename: string | null;
  productUrl: string | null;
  matchScore: number;
  reason: string;
}

export interface RecommendationResponse {
  recommendations: GiftRecommendation[];
}
