/** Request body for POST /api/people/:id/recommendations. */
export interface RecommendationRequest {
  budget?: number;
  ageRange?: string;
  occasion?: string;
  additionalInfo?: string;
}

/** Public recommendation returned by Giftory's backend. */
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
