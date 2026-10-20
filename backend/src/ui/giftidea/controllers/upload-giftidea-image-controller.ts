import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { UpdateGiftIdeaImageUseCase } from '../../../domain/giftidea/use-cases/UpdateGiftIdeaImageUseCase';
import {
  deleteGiftIdeaImage,
  saveGiftIdeaImage,
} from '../../../infrastructure/giftidea/giftidea-image-storage';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { giftIdeaIdSchema } from './get-giftidea-controller';

export const createUploadGiftIdeaImageController =
  (updateGiftIdeaImageUseCase: UpdateGiftIdeaImageUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    let newFilename: string | null = null;
    try {
      const idResult = giftIdeaIdSchema.safeParse(req.params.id);
      if (!idResult.success) {
        throw new ValidationError(idResult.error.issues[0].message);
      }

      if (!req.file) {
        throw new ValidationError('Selecciona una imagen.');
      }

      const userId = getAuthenticatedUserId(res);
      newFilename = await saveGiftIdeaImage(req.file.buffer, req.file.mimetype);
      const { giftIdea, previousImageFilename } = await updateGiftIdeaImageUseCase.execute(
        userId,
        idResult.data,
        newFilename,
      );
      newFilename = null;
      try {
        await deleteGiftIdeaImage(previousImageFilename);
      } catch (cleanupError) {
        console.error('No se pudo borrar la imagen anterior:', cleanupError);
      }
      res.status(200).json({ imageFilename: giftIdea.imageFilename });
    } catch (error) {
      if (newFilename) {
        try {
          await deleteGiftIdeaImage(newFilename);
        } catch (cleanupError) {
          console.error('No se pudo limpiar la imagen nueva:', cleanupError);
        }
      }
      next(error);
    }
  };

export const createDeleteGiftIdeaImageController =
  (updateGiftIdeaImageUseCase: UpdateGiftIdeaImageUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idResult = giftIdeaIdSchema.safeParse(req.params.id);
      if (!idResult.success) {
        throw new ValidationError(idResult.error.issues[0].message);
      }

      const userId = getAuthenticatedUserId(res);
      const { previousImageFilename } = await updateGiftIdeaImageUseCase.execute(
        userId,
        idResult.data,
        null,
      );

      try {
        await deleteGiftIdeaImage(previousImageFilename);
      } catch (cleanupError) {
        console.error('No se pudo borrar la imagen:', cleanupError);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
