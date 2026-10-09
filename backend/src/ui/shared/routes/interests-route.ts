import { Router } from 'express';
import { INTERESTS } from '../../../domain/shared/Interest';

export const interestsRouter = Router();
interestsRouter.get('/interests', (_req, res) => {
  res.status(200).json(INTERESTS);
});
