import { RequestHandler, Router } from 'express';
import { ListLibraryItemsUseCase } from '../../domain/library/use-cases/ListLibraryItemsUseCase';
import { createListLibraryController } from './controllers/list-library-items-controller';
import { createAddLibraryItemController } from './controllers/add-library-item-controller';
import { AddLibraryItemUseCase } from '../../domain/library/use-cases/AddLibraryItemUseCase';
import { DeleteLibraryItemUseCase } from '../../domain/library/use-cases/DeleteLibraryItemUseCase';
import { createDeleteLibraryItemController } from './controllers/delete-library-item-controller';

interface LibraryRouterDependencies {
  authenticationMiddleware: RequestHandler;
  listLibraryItemsUseCase: ListLibraryItemsUseCase;
  addLibraryItemUseCase: AddLibraryItemUseCase;
  deleteLibraryItemUseCase: DeleteLibraryItemUseCase;
}

export const createLibraryRouter = ({
  authenticationMiddleware,
  listLibraryItemsUseCase,
  addLibraryItemUseCase,
  deleteLibraryItemUseCase,
}: LibraryRouterDependencies) => {
  const libraryRouter = Router();
  libraryRouter.use(authenticationMiddleware);
  libraryRouter.get('/', createListLibraryController(listLibraryItemsUseCase));
  libraryRouter.post('/', createAddLibraryItemController(addLibraryItemUseCase));
  libraryRouter.delete('/:id', createDeleteLibraryItemController(deleteLibraryItemUseCase));

  return libraryRouter;
};
