import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { CreatePersonUseCase } from '../../../domain/person/use-cases/CreatePersonUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { createPersonSchema, toPersonResponse } from '../person-schemas';

//crea el controlador de crear persona
//POST /api/people builds the controller that creates a person.
export const createCreatePersonController =
  (createPersonUseCase: CreatePersonUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //user who makes the request (set by the authentication middleware)
      const userId = getAuthenticatedUserId(res);
      //validate the body: name is required, interests are optional (400 if invalid)
      const result = createPersonSchema.safeParse(req.body);

      if (!result.success) {
        throw new ValidationError(result.error.issues[0].message);
      }

      const { name, interests } = result.data;
      // the use case trims the name and removes duplicated interests
      const person = await createPersonUseCase.execute({ userId, name, interests });

      // 201 created with the new person
      res.status(201).json(toPersonResponse(person));
    } catch (error) {
      next(error);
    }
  };
