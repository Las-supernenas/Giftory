import { Router, RequestHandler } from 'express';
import { RegisterUserUseCase } from '../../domain/user/use-cases/RegisterUserUseCase';
import { createRegisterUserController } from './controllers/register-user-controller';
import { createLoginUserController } from './controllers/login-user-controller';
import { LoginUserUseCase } from '../../domain/user/use-cases/LoginUserUseCase';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from './auth-cookie';
import { GetCurrentUserUseCase } from '../../domain/user/use-cases/GetCurrentUserUseCase';
import { createGetSessionController } from './controllers/get-session-controller';

export interface UserRouterDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
  cookieSecure: boolean;
  authenticationMiddleware: RequestHandler;
}

export const createUserRouter = ({
  registerUserUseCase,
  loginUserUseCase,
  getCurrentUserUseCase,
  cookieSecure,
  authenticationMiddleware,
}: UserRouterDependencies) => {
  const userRouter = Router();

  userRouter.post('/register', createRegisterUserController(registerUserUseCase));
  userRouter.post('/login', createLoginUserController(loginUserUseCase, cookieSecure));
  userRouter.get(
    '/session',
    authenticationMiddleware,
    createGetSessionController(getCurrentUserUseCase),
  );
  userRouter.post('/logout', (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions(cookieSecure));
    res.sendStatus(204);
  });

  return userRouter;
};
