import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { GetGiftIdeaUseCase } from '../../../domain/giftidea/use-cases/GetGiftIdeaUseCase';
import { z } from 'zod';

export const giftIdeaIdSchema = z.coerce
  .number({ error: 'Invalid gift idea id.' })
  .int('Invalid gift idea id.')
  .positive('Invalid gift idea id.');

export const createGetGiftIdeaController =
  (getGiftIdeaUseCase: GetGiftIdeaUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idResult = giftIdeaIdSchema.safeParse(req.params.id);
      if (!idResult.success) {
        throw new ValidationError(idResult.error.issues[0].message);
      }

      const giftIdea = await getGiftIdeaUseCase.execute({ id: idResult.data });

      res.status(200).json({
        id: giftIdea.id,
        name: giftIdea.name,
        price: giftIdea.price,
        interests: giftIdea.interests,
      });
    } catch (error) {
      next(error);
    }
  };
