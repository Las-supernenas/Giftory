import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { DeleteLibraryItemUseCase } from '../../../domain/library/use-cases/DeleteLibraryItemUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';

const libraryItemIdSchema = z.coerce.number().int().positive();

export const createDeleteLibraryItemController =
  (deleteLibraryItemUseCase: DeleteLibraryItemUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);
      const idResult = libraryItemIdSchema.safeParse(req.params.id);
      if (!idResult.success) {
        throw new ValidationError(idResult.error.issues[0].message);
      }
      await deleteLibraryItemUseCase.execute({
        userId,
        libraryItemId: idResult.data,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
