import { NextFunction, Request, Response } from 'express';
import { ListPeopleUseCase } from '../../../domain/person/use-cases/ListPeopleUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { toPersonResponse } from '../person-schemas';

export const createListPeopleController =
  (listPeopleUseCase: ListPeopleUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);

      const people = await listPeopleUseCase.execute({ userId });

      res.status(200).json(people.map(toPersonResponse));
    } catch (error) {
      next(error);
    }
  };
