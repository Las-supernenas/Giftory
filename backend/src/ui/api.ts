import express from 'express';
import { healthRouter } from './shared/routes/health-route';
import { notFoundMiddleware } from './shared/middlewares/not-found-middleware';
import { errorHandlerMiddleware } from './shared/middlewares/error-handler-middleware';
import { userRouter } from './user/user-router';

export const createApi = () => {
  const api = express();

  api.use(express.json());

  api.use('/api', healthRouter);
  api.use('/users',userRouter)


  api.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  api.use(notFoundMiddleware);
  api.use(errorHandlerMiddleware);


  return api;
};



