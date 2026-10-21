import { NextFunction, Request, Response } from 'express';
import { GetCurrentUserUseCase } from '../../../domain/user/use-cases/GetCurrentUserUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';

export const createGetSessionController =
  (getCurrentUserUseCase: GetCurrentUserUseCase) =>
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);
      const user = await getCurrentUserUseCase.execute(userId);

      // Personal data: the browser must not cache it
      res.set('Cache-Control', 'no-store');
      // Only public data: never the email or the password hash
      res.status(200).json({
        id: user.id,
        name: user.name,
      });
    } catch (error) {
      next(error);
    }
  };
