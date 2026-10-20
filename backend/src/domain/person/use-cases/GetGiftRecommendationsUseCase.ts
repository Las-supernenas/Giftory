import type { PersonRepository } from '../repositories/PersonRepository';
import type { GiftIdeaRepository } from '../../giftidea/repositories/GiftIdeaRepository';
import type {
  GiftRecommendationService,
  AIRecommendation,
} from '../services/GiftRecommendationService';
import type { GetGiftRecommendationsUseCaseInput } from './GetGiftRecommendationsUseCaseInput';
import type { RecommendationResponse } from '../recommendation-types';

import { EntityNotFoundError } from '../../errors/EntityNotFoundError';
import { RecommendationProviderResponseError } from '../../errors/RecommendationProviderResponseError';

export class GetGiftRecommendationsUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly giftIdeaRepository: GiftIdeaRepository,
    private readonly recommendationService: GiftRecommendationService,
  ) {}

  async execute(input: GetGiftRecommendationsUseCaseInput): Promise<RecommendationResponse> {
    // 1. Find the Person and verify ownership.
    const person = await this.personRepository.findByIdAndUserId(input.personId, input.userId);

    if (!person) {
      throw new EntityNotFoundError('Person', String(input.personId));
    }

    // 2. Retrieve the active GiftIdeas from the shared catalog.
    const giftIdeas = await this.giftIdeaRepository.findAll();

    // 3. Apply the optional budget filter.
    // The budget is inclusive: price === budget is allowed.
    const eligibleGiftIdeas = giftIdeas.filter(
      (giftIdea) => input.budget === undefined || giftIdea.price <= input.budget,
    );

    // 4. Avoid calling the AI if no eligible gifts exist.
    if (eligibleGiftIdeas.length === 0) {
      return { recommendations: [] };
    }

    // 5. Prepare the data for the recommendation service.
    const aiInput = {
      interests: person.interests,
      ageRange: input.ageRange,
      occasion: input.occasion,
      additionalInfo: input.additionalInfo,
      giftIdeas: eligibleGiftIdeas.map((giftIdea) => ({
        id: giftIdea.id,
        name: giftIdea.name,
        price: giftIdea.price,
        description: giftIdea.description ?? null,
      })),
    };

    // 6. Call the recommendation service.
    const aiRecommendations = await this.recommendationService.recommend(aiInput);

    // 7. Validate the complete AI response.
    if (!Array.isArray(aiRecommendations) || aiRecommendations.length > 5) {
      throw new RecommendationProviderResponseError();
    }

    // Build a lookup containing only eligible GiftIdeas.
    const eligibleGiftIdeasById = new Map(
      eligibleGiftIdeas.map((giftIdea) => [giftIdea.id, giftIdea]),
    );

    const seenIds = new Set<number>();

    for (const recommendation of aiRecommendations) {
      if (recommendation === null || typeof recommendation !== 'object') {
        throw new RecommendationProviderResponseError();
      }

      const { giftIdeaId, matchScore, reason } = recommendation as AIRecommendation;

      // Reject invalid, unknown, duplicate, or ineligible IDs.
      if (
        !Number.isSafeInteger(giftIdeaId) ||
        giftIdeaId <= 0 ||
        !eligibleGiftIdeasById.has(giftIdeaId) ||
        seenIds.has(giftIdeaId)
      ) {
        throw new RecommendationProviderResponseError();
      }

      // The AI must return an integer score between 0 and 100.
      if (!Number.isInteger(matchScore) || matchScore < 0 || matchScore > 100) {
        throw new RecommendationProviderResponseError();
      }

      // The reason must be a non-empty string.
      if (typeof reason !== 'string' || reason.trim().length === 0) {
        throw new RecommendationProviderResponseError();
      }

      seenIds.add(giftIdeaId);
    }

    // 8. Sort recommendations by match score (highest first).
    const sortedRecommendations = [...aiRecommendations].sort(
      (a, b) => b.matchScore - a.matchScore,
    );

    // 9. Enrich recommendations with authoritative database values.
    const recommendations = sortedRecommendations.map((recommendation) => {
      const giftIdea = eligibleGiftIdeasById.get(recommendation.giftIdeaId);

      // The previous validation guarantees this lookup succeeds.
      if (!giftIdea) {
        throw new RecommendationProviderResponseError();
      }

      return {
        giftIdeaId: giftIdea.id,
        name: giftIdea.name,
        price: giftIdea.price,
        matchScore: recommendation.matchScore,
        reason: recommendation.reason,
      };
    });

    return { recommendations };
  }
}
