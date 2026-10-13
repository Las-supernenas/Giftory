import { NextFunction, Request, Response } from 'express';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { DeleteSavedIdeaUseCase } from '../../../domain/savedidea/use-cases/DeleteSavedIdeaUseCase';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { personIdSchema } from '../../person/person-schemas';
import { z } from 'zod';

const savedIdeaIdSchema = z.coerce.number().int().positive();
export const createDeleteSavedIdeaController =
  (deleteSavedIdeaUseCase: DeleteSavedIdeaUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);
      const personIdResult = personIdSchema.safeParse(req.params.personId);
      if (!personIdResult.success) {
        throw new ValidationError(personIdResult.error.issues[0].message);
      }
      const savedIdeaIdResult = savedIdeaIdSchema.safeParse(req.params.id);
      if (!savedIdeaIdResult.success) {
        throw new ValidationError(savedIdeaIdResult.error.issues[0].message);
      }
      await deleteSavedIdeaUseCase.execute({
        userId,
        personId: personIdResult.data,
        savedIdeaId: savedIdeaIdResult.data,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
