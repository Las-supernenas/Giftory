import { RequestHandler, Router } from 'express';
import { CreateGiftIdeaUseCase } from '../../domain/giftidea/use-cases/CreateGiftIdeaUseCase';
import { GetGiftIdeaUseCase } from '../../domain/giftidea/use-cases/GetGiftIdeaUseCase';
import { ListGiftIdeaUseCase } from '../../domain/giftidea/use-cases/ListGiftIdeaUseCase';
import { createCreateGiftIdeaController } from './controllers/create-giftidea-controller';
import { createGetGiftIdeaController } from './controllers/get-giftidea-controller';
import { createListGiftIdeaController } from './controllers/list-giftidea-controller';

export interface GiftIdeaRouterDependencies {
  authenticationMiddleware: RequestHandler;
  createGiftIdeaUseCase: CreateGiftIdeaUseCase;
  getGiftIdeaUseCase: GetGiftIdeaUseCase;
  listGiftIdeaUseCase: ListGiftIdeaUseCase;
}

export const createGiftIdeaRouter = ({
  authenticationMiddleware,
  createGiftIdeaUseCase,
  getGiftIdeaUseCase,
  listGiftIdeaUseCase,
}: GiftIdeaRouterDependencies) => {
  const giftIdeaRouter = Router();

  giftIdeaRouter.get('/', createListGiftIdeaController(listGiftIdeaUseCase));
  giftIdeaRouter.post(
    '/',
    authenticationMiddleware,
    createCreateGiftIdeaController(createGiftIdeaUseCase)
  );
  giftIdeaRouter.get('/:id', createGetGiftIdeaController(getGiftIdeaUseCase));

  return giftIdeaRouter;
};
