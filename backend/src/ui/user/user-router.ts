import { Router } from 'express';
import { RegisterUserUseCase } from '../../domain/user/use-cases/RegisterUserUseCase';
import { createRegisterUserController } from './controllers/register-user-controller';

export const createUserRouter = (registerUserUseCase: RegisterUserUseCase) => {
  const userRouter = Router();

  userRouter.post(
    '/register',
    createRegisterUserController(registerUserUseCase),
  );

  return userRouter;
};
