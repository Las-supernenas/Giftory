import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { AddLibraryItemUseCase } from '../../../domain/library/use-cases/AddLibraryItemUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';

const addLibraryItemSchema = z.object({
  giftIdeaId: z.number().int().positive(),
});

export const createAddLibraryItemController =
  (addLibraryItemUseCase: AddLibraryItemUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);
      const result = addLibraryItemSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError(result.error.issues[0].message);
      }
      const libraryItem = await addLibraryItemUseCase.execute({
        userId,
        giftIdeaId: result.data.giftIdeaId,
      });
      res.status(201).json({
        id: libraryItem.id,
        giftIdea: {
          id: libraryItem.giftIdea.id,
          name: libraryItem.giftIdea.name,
          price: libraryItem.giftIdea.price,
          interests: libraryItem.giftIdea.interests,
          description: libraryItem.giftIdea.description,
          productUrl: libraryItem.giftIdea.productUrl,
          imageFilename: libraryItem.giftIdea.imageFilename,
        },
      });
    } catch (error) {
      next(error);
    }
  };
