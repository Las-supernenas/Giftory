import { Router } from 'express';
import { RegisterUserUseCase } from '../../domain/user/use-cases/RegisterUserUseCase';
import { createRegisterUserController } from './controllers/register-user-controller';
import { createLoginUserController } from './controllers/login-user-controller';
import { LoginUserUseCase } from '../../domain/user/use-cases/LoginUserUseCase';

export interface UserRouterDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
}

export const createUserRouter = ({
  registerUserUseCase,
  loginUserUseCase,
}: UserRouterDependencies) => {
  const userRouter = Router();

  userRouter.post('/register', createRegisterUserController(registerUserUseCase));
  userRouter.post('/login', createLoginUserController(loginUserUseCase));

  return userRouter;
};
