import { RequestHandler, Router } from 'express';
import { ListLibraryItemsUseCase } from '../../domain/library/use-cases/ListLibraryItemsUseCase';
import { createListLibraryController } from './controllers/list-library-items-controller';

interface LibraryRouterDependencies {
  authenticationMiddleware: RequestHandler;
  listLibraryItemsUseCase: ListLibraryItemsUseCase;
}

export const createLibraryRouter = ({
  authenticationMiddleware,
  listLibraryItemsUseCase,
}: LibraryRouterDependencies) => {
  const libraryRouter = Router();
  libraryRouter.use(authenticationMiddleware);
  libraryRouter.get('/', createListLibraryController(listLibraryItemsUseCase));

  return libraryRouter;
};
