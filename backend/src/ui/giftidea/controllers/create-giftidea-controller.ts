import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { CreateGiftIdeaUseCase } from '../../../domain/giftidea/use-cases/CreateGiftIdeaUseCase';
import { INTERESTS } from '../../../domain/shared/Interest';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';

export const createGiftIdeaSchema = z.object({
  name: z
    .string({ error: 'Name is required.' })
    .trim()
    .min(1, 'Name is required.')
    .max(100, 'Name must have at most 100 characters.'),
  price: z
    .number({ error: 'Price must be a non-negative number.' })
    .finite('Price must be a non-negative number.')
    .min(0, 'Price must be a non-negative number.'),
  interests: z
    .array(z.enum(INTERESTS, { error: 'Invalid interest.' }), {
      error: 'Interests must be a list.',
    })
    .optional(),
});

export const createCreateGiftIdeaController =
  (createGiftIdeaUseCase: CreateGiftIdeaUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthenticatedUserId(res);
      const result = createGiftIdeaSchema.safeParse(req.body);

      if (!result.success) {
        throw new ValidationError(result.error.issues[0].message);
      }

      const giftIdea = await createGiftIdeaUseCase.execute({
        userId,
        name: result.data.name,
        price: result.data.price,
        interests: result.data.interests ?? [],
      });

      res.status(201).json({
        id: giftIdea.id,
        name: giftIdea.name,
        price: giftIdea.price,
        interests: giftIdea.interests,
      });
    } catch (error) {
      next(error);
    }
  };
