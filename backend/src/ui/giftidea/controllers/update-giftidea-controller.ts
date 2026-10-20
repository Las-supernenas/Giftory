import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { UpdateGiftIdeaUseCase } from '../../../domain/giftidea/use-cases/UpdateGiftIdeaUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { createGiftIdeaSchema } from './create-giftidea-controller';
import { giftIdeaIdSchema } from './get-giftidea-controller';

export const createUpdateGiftIdeaController =
  (updateGiftIdeaUseCase: UpdateGiftIdeaUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);
      const idResult = giftIdeaIdSchema.safeParse(req.params.id);
      if (!idResult.success) {
        throw new ValidationError(idResult.error.issues[0].message);
      }

      const bodyResult = createGiftIdeaSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError(bodyResult.error.issues[0].message);
      }

      const giftIdea = await updateGiftIdeaUseCase.execute({
        userId,
        giftIdeaId: idResult.data,
        name: bodyResult.data.name,
        price: bodyResult.data.price,
        interests: bodyResult.data.interests ?? [],
        description: bodyResult.data.description,
        productUrl: bodyResult.data.productUrl,
      });

      res.status(200).json({
        id: giftIdea.id,
        name: giftIdea.name,
        price: giftIdea.price,
        interests: giftIdea.interests,
        description: giftIdea.description,
        productUrl: giftIdea.productUrl,
        imageFilename: giftIdea.imageFilename,
      });
    } catch (error) {
      next(error);
    }
  };
