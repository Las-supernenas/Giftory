import { RequestHandler, Router } from 'express';
import { CreateGiftIdeaUseCase } from '../../domain/giftidea/use-cases/CreateGiftIdeaUseCase';
import { UpdateGiftIdeaUseCase } from '../../domain/giftidea/use-cases/UpdateGiftIdeaUseCase';
import { GetGiftIdeaUseCase } from '../../domain/giftidea/use-cases/GetGiftIdeaUseCase';
import { ListGiftIdeaUseCase } from '../../domain/giftidea/use-cases/ListGiftIdeaUseCase';
import { createCreateGiftIdeaController } from './controllers/create-giftidea-controller';
import { createUpdateGiftIdeaController } from './controllers/update-giftidea-controller';
import { createGetGiftIdeaController } from './controllers/get-giftidea-controller';
import { createListGiftIdeaController } from './controllers/list-giftidea-controller';

export interface GiftIdeaRouterDependencies {
  authenticationMiddleware: RequestHandler;
  createGiftIdeaUseCase: CreateGiftIdeaUseCase;
  getGiftIdeaUseCase: GetGiftIdeaUseCase;
  listGiftIdeaUseCase: ListGiftIdeaUseCase;
  updateGiftIdeaUseCase: UpdateGiftIdeaUseCase;
}

export const createGiftIdeaRouter = ({
  authenticationMiddleware,
  createGiftIdeaUseCase,
  getGiftIdeaUseCase,
  listGiftIdeaUseCase,
  updateGiftIdeaUseCase,
}: GiftIdeaRouterDependencies) => {
  const giftIdeaRouter = Router();

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

  return giftIdeaRouter;
};
