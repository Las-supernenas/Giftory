import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { UpdatePersonUseCase } from '../../../domain/person/use-cases/UpdatePersonUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { personIdSchema, toPersonResponse, updatePersonSchema } from '../person-schemas';

//PATCH /api/people/:id builds the controller that udates a person
export const createUpdatePersonController =
  (updatePersonUseCase: UpdatePersonUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //user who makes the request (set by the authentication middleware)
      const userId = getAuthenticatedUserId(res);

      //validate the :id from the URL and convert it to a number (400 if invalid)
      const idResult = personIdSchema.safeParse(req.params.id);
      if (!idResult.success) {
        throw new ValidationError(idResult.error.issues[0].message);
      }

      /// validate the body: name and/or interests (400 if invalid or empty)
      const bodyResult = updatePersonSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError(bodyResult.error.issues[0].message);
      }

      const { name, interests } = bodyResult.data;

      //// the use case checks ownership: another user's person returns 404
      const person = await updatePersonUseCase.execute({
        userId,
        personId: idResult.data,
        name,
        interests,
      });

      // 200 with the updated person
      res.status(200).json(toPersonResponse(person));
    } catch (error) {
      // any error goes to the error handler middleware
      next(error);
    }
  };
