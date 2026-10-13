import { NextFunction, Request, Response } from 'express';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { AddSavedIdeaUseCase } from '../../../domain/savedidea/use-cases/AddSavedIdeaUseCase';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { personIdSchema } from '../../person/person-schemas';
import { z } from 'zod';

const addSavedIdeaSchema = z.object({ giftIdeaId: z.number().int().positive() });

export const createAddSavedIdeaController =
  (addSavedIdeaUseCase: AddSavedIdeaUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);
      const personIdResult = personIdSchema.safeParse(req.params.personId);
      if (!personIdResult.success) {
        throw new ValidationError(personIdResult.error.issues[0].message);
      }
      const bodyResult = addSavedIdeaSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError(bodyResult.error.issues[0].message);
      }
      const savedIdea = await addSavedIdeaUseCase.execute({
        userId,
        personId: personIdResult.data,
        giftIdeaId: bodyResult.data.giftIdeaId,
      });
      res.status(201).json({
        id: savedIdea.id,
        giftIdea: {
          id: savedIdea.giftIdea.id,
          name: savedIdea.giftIdea.name,
          price: savedIdea.giftIdea.price,
          interests: savedIdea.giftIdea.interests,
        },
      });
    } catch (error) {
      next(error);
    }
  };
