import { Router, RequestHandler } from 'express';
import { RegisterUserUseCase } from '../../domain/user/use-cases/RegisterUserUseCase';
import { createRegisterUserController } from './controllers/register-user-controller';
import { createLoginUserController } from './controllers/login-user-controller';
import { LoginUserUseCase } from '../../domain/user/use-cases/LoginUserUseCase';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from './auth-cookie';

export interface UserRouterDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  cookieSecure: boolean;
  authenticationMiddleware: RequestHandler;
}

export const createUserRouter = ({
  registerUserUseCase,
  loginUserUseCase,
  cookieSecure,
  authenticationMiddleware,
}: UserRouterDependencies) => {
  const userRouter = Router();

  userRouter.post('/register', createRegisterUserController(registerUserUseCase));
  userRouter.post('/login', createLoginUserController(loginUserUseCase, cookieSecure));
  userRouter.get('/session', authenticationMiddleware, (_req, res) => {
    res.sendStatus(204);
  });
  userRouter.post('/logout', (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions(cookieSecure));
    res.sendStatus(204);
  });

  return userRouter;
};
