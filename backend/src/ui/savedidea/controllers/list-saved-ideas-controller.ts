import { ListSavedIdeasUseCase } from '../../../domain/savedidea/use-cases/ListSavedIdeasUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { personIdSchema } from '../../person/person-schemas';

export const createListSavedIdeasController =
  (listSavedIdeasUseCase: ListSavedIdeasUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);
      const personIdResult = personIdSchema.safeParse(req.params.personId);
      if (!personIdResult.success) {
        throw new ValidationError(personIdResult.error.issues[0].message);
      }
      const savedIdeas = await listSavedIdeasUseCase.execute({
        userId,
        personId: personIdResult.data,
      });
      res.status(200).json(
        savedIdeas.map((item) => ({
          id: item.id,
          privateNote: item.privateNote,
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
