import { NextFunction, Request, Response } from 'express';
import { ListGiftIdeaUseCase } from '../../../domain/giftidea/use-cases/ListGiftIdeaUseCase';

export const createListGiftIdeaController =
  (listGiftIdeaUseCase: ListGiftIdeaUseCase) =>
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const giftIdeas = await listGiftIdeaUseCase.execute();

      res.status(200).json(
        giftIdeas.map((giftIdea) => ({
          id: giftIdea.id,
          name: giftIdea.name,
          price: giftIdea.price,
          interests: giftIdea.interests,
        })),
      );
    } catch (error) {
      next(error);
    }
  };
