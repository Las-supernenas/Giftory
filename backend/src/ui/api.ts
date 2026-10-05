import express from 'express';
import { healthRouter } from './shared/routes/health-route';
import { notFoundMiddleware } from './shared/middlewares/not-found-middleware';
import { errorHandlerMiddleware } from './shared/middlewares/error-handler-middleware';
import { createUserRouter } from './user/user-router';
import { LoginUserUseCase } from '../domain/user/use-cases/LoginUserUseCase';
import { RegisterUserUseCase } from '../domain/user/use-cases/RegisterUserUseCase';
import type { RequestHandler } from 'express';

// All the use cases the HTTP layer needs. Created in index.ts and passed to the routers.
// When a new use case is added, add it here too.

export interface ApiDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  authenticationMiddleware: RequestHandler;
}

export const createApi = (dependencies: ApiDependencies) => {
  const api = express();

  api.use(express.json());

  api.use('/api', healthRouter);
  api.use('/api/users', createUserRouter(dependencies));

  api.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  api.use(notFoundMiddleware);
  api.use(errorHandlerMiddleware);

  return api;
};
