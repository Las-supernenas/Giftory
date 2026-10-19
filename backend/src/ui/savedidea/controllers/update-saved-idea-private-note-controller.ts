import { NextFunction, Request, Response } from 'express';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { UpdateSavedIdeaPrivateNoteUseCase } from '../../../domain/savedidea/use-cases/UpdateSavedIdeaPrivateNoteUseCase';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { personIdSchema } from '../../person/person-schemas';
import { z } from 'zod';

const savedIdeaIdSchema = z.coerce.number().int().positive();
const updatePrivateNoteSchema = z.object({
  privateNote: z.string().nullable(),
});

export const createUpdateSavedIdeaPrivateNoteController =
  (updatePrivateNoteUseCase: UpdateSavedIdeaPrivateNoteUseCase) =>
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
      const bodyResult = updatePrivateNoteSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError(bodyResult.error.issues[0].message);
      }
      const savedIdea = await updatePrivateNoteUseCase.execute({
        userId,
        personId: personIdResult.data,
        savedIdeaId: savedIdeaIdResult.data,
        privateNote: bodyResult.data.privateNote,
      });
      res.status(200).json({
        id: savedIdea.id,
        privateNote: savedIdea.privateNote,
        canEditGiftIdea: savedIdea.giftIdea.userId === userId,
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
