import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import type { RecommendationResponse } from '../../../domain/person/recommendation-types';
import type { GetGiftRecommendationsUseCaseInput } from '../../../domain/person/use-cases/GetGiftRecommendationsUseCaseInput';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { personIdSchema, recommendationRequestSchema } from '../person-schemas';

// what the controller needs from the use case: only its execute method
// GetGiftRecommendationsUseCase (task A) has this shape, so it can be injected here
export interface GetGiftRecommendationsExecutor {
  execute(input: GetGiftRecommendationsUseCaseInput): Promise<RecommendationResponse>;
}

// POST /api/people/:id/recommendations builds the controller that returns AI gift recommendations
export const createGetGiftRecommendationsController =
  (getGiftRecommendationsUseCase: GetGiftRecommendationsExecutor) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //user who makes the request (set by the authentication middleware), never from the body
      const userId = getAuthenticatedUserId(res);

      //validate the :id from the URL and convert it to a number (400 if invalid)
      const idResult = personIdSchema.safeParse(req.params.id);
      if (!idResult.success) {
        throw new ValidationError(idResult.error.issues[0].message);
      }
      // validate the optional preferences in the body (400 if invalid)
      const bodyResult = recommendationRequestSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError(bodyResult.error.issues[0].message);
      }

      const { budget, ageRange, occasion, additionalInfo } = bodyResult.data;

      // the use case checks ownership (404), filters by budget and validates the AI answer (502/504)
      const result = await getGiftRecommendationsUseCase.execute({
        userId,
        personId: idResult.data,
        budget,
        ageRange,
        occasion,
        additionalInfo,
      });

      //200 with the recommendations, also when the list is empty
      res.status(200).json(result);
    } catch (error) {
      //any error goes to the error handler middleware
      next(error);
    }
  };
