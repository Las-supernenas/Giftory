import { NextFunction, Request, Response } from 'express';
import { ListLibraryItemsUseCase } from '../../../domain/library/use-cases/ListLibraryItemsUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';

export const createListLibraryController =
  (listLibraryItemsUseCase: ListLibraryItemsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);

      const libraryItems = await listLibraryItemsUseCase.execute({ userId });
      res.status(200).json(
        libraryItems.map((item) => ({
          id: item.id,
          canEditGiftIdea: item.giftIdea.userId === userId,
          giftIdea: {
            id: item.giftIdea.id,
            name: item.giftIdea.name,
            price: item.giftIdea.price,
            interests: item.giftIdea.interests,
          },
        })),
      );
    } catch (error) {
      next(error);
    }
  };
