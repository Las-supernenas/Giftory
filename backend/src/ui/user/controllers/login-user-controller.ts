import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { LoginUserUseCase } from '../../../domain/user/use-cases/LoginUserUseCase';

const loginUserSchema = z.object({
  email: z.email({ error: 'Email is required and must be valid.' }),
  password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.'),
});

export const createLoginUserController =
  (loginUserUseCase: LoginUserUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = loginUserSchema.safeParse(req.body);

      if (!result.success) {
        throw new ValidationError(result.error.issues[0].message);
      }

      const { accessToken, user } = await loginUserUseCase.execute(result.data);

      // Never return the password hash
      res.status(200).json({
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  };
