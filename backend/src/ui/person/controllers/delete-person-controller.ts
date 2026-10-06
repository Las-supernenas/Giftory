import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { DeletePersonUseCase } from '../../../domain/person/use-cases/DeletePersonUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { personIdSchema } from '../person-schemas';

export const createDeletePersonController =
  (deletePersonUseCase: DeletePersonUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);

      const idResult = personIdSchema.safeParse(req.params.id);
      if (!idResult.success) {
        throw new ValidationError(idResult.error.issues[0].message);
      }

      await deletePersonUseCase.execute({ userId, personId: idResult.data });

      // 204 no Content: deleted, nothing to return
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
