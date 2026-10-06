import { Response } from 'express';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

//Returns the id of the authenticated user, saved in res.local by authentication middle.
// 401 if by any chance route was not protected by middleware

export const getAuthenticatedUserId = (res: Response): number => {
  const userId = res.locals.userId;

  if (typeof userId !== 'number') {
    throw new UnauthorizedError('Authentication token is required.');
  }

  return userId;
};
