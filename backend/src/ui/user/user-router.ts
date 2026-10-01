import { Router } from 'express';

export const userRouter = Router();

userRouter.post('/', (req, res) => {
  res.status(501).json({
    message: 'User registration not implemented yet',
  });
});