import { RequestHandler, Router } from 'express';
import { ListLibraryItemsUseCase } from '../../domain/library/use-cases/ListLibraryItemsUseCase';
import { createListLibraryController } from './controllers/list-library-items-controller';
import { createAddLibraryItemController } from './controllers/add-library-item-controller';
import { AddLibraryItemUseCase } from '../../domain/library/use-cases/AddLibraryItemUseCase';

interface LibraryRouterDependencies {
  authenticationMiddleware: RequestHandler;
  listLibraryItemsUseCase: ListLibraryItemsUseCase;
  addLibraryItemUseCase: AddLibraryItemUseCase;
}

export const createLibraryRouter = ({
  authenticationMiddleware,
  listLibraryItemsUseCase,
  addLibraryItemUseCase,
}: LibraryRouterDependencies) => {
  const libraryRouter = Router();
  libraryRouter.use(authenticationMiddleware);
  libraryRouter.get('/', createListLibraryController(listLibraryItemsUseCase));
  libraryRouter.post('/', createAddLibraryItemController(addLibraryItemUseCase));

  return libraryRouter;
};
