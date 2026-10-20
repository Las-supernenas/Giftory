import express, { RequestHandler, Router } from 'express';
import { CreateGiftIdeaUseCase } from '../../domain/giftidea/use-cases/CreateGiftIdeaUseCase';
import { UpdateGiftIdeaUseCase } from '../../domain/giftidea/use-cases/UpdateGiftIdeaUseCase';
import { GetGiftIdeaUseCase } from '../../domain/giftidea/use-cases/GetGiftIdeaUseCase';
import { ListGiftIdeaUseCase } from '../../domain/giftidea/use-cases/ListGiftIdeaUseCase';
import { createCreateGiftIdeaController } from './controllers/create-giftidea-controller';
import { createUpdateGiftIdeaController } from './controllers/update-giftidea-controller';
import { createGetGiftIdeaController } from './controllers/get-giftidea-controller';
import { createListGiftIdeaController } from './controllers/list-giftidea-controller';
import { UpdateGiftIdeaImageUseCase } from '../../domain/giftidea/use-cases/UpdateGiftIdeaImageUseCase';
import { giftIdeaImagesDirectory } from '../../infrastructure/giftidea/giftidea-image-storage';
import multer from 'multer';
import {
  createUploadGiftIdeaImageController,
  createDeleteGiftIdeaImageController,
} from './controllers/upload-giftidea-image-controller';

export interface GiftIdeaRouterDependencies {
  authenticationMiddleware: RequestHandler;
  createGiftIdeaUseCase: CreateGiftIdeaUseCase;
  getGiftIdeaUseCase: GetGiftIdeaUseCase;
  listGiftIdeaUseCase: ListGiftIdeaUseCase;
  updateGiftIdeaUseCase: UpdateGiftIdeaUseCase;
  updateGiftIdeaImageUseCase: UpdateGiftIdeaImageUseCase;
}

export const createGiftIdeaRouter = ({
  authenticationMiddleware,
  createGiftIdeaUseCase,
  getGiftIdeaUseCase,
  listGiftIdeaUseCase,
  updateGiftIdeaUseCase,
  updateGiftIdeaImageUseCase,
}: GiftIdeaRouterDependencies) => {
  const giftIdeaRouter = Router();

  giftIdeaRouter.use('/images', express.static(giftIdeaImagesDirectory, { index: false }));

  const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  });

  giftIdeaRouter.get('/', createListGiftIdeaController(listGiftIdeaUseCase));

  giftIdeaRouter.post(
    '/',
    authenticationMiddleware,
    createCreateGiftIdeaController(createGiftIdeaUseCase),
  );

  giftIdeaRouter.get('/:id', createGetGiftIdeaController(getGiftIdeaUseCase));

  giftIdeaRouter.patch(
    '/:id',
    authenticationMiddleware,
    createUpdateGiftIdeaController(updateGiftIdeaUseCase),
  );

  giftIdeaRouter.post(
    '/:id/image',
    authenticationMiddleware,
    uploadImage.single('image'),
    createUploadGiftIdeaImageController(updateGiftIdeaImageUseCase),
  );
  giftIdeaRouter.delete(
    '/:id/image',
    authenticationMiddleware,
    createDeleteGiftIdeaImageController(updateGiftIdeaImageUseCase),
  );

  return giftIdeaRouter;
};
