import { RequestHandler, Router } from 'express';
import { ListSavedIdeasUseCase } from '../../domain/savedidea/use-cases/ListSavedIdeasUseCase';
import { AddSavedIdeaUseCase } from '../../domain/savedidea/use-cases/AddSavedIdeaUseCase';
import { DeleteSavedIdeaUseCase } from '../../domain/savedidea/use-cases/DeleteSavedIdeaUseCase';
import { createListSavedIdeasController } from './controllers/list-saved-ideas-controller';
import { createAddSavedIdeaController } from './controllers/add-saved-idea-controller';
import { createDeleteSavedIdeaController } from './controllers/delete-saved-idea-controller';

export interface SavedIdeaRouterDependencies {
  authenticationMiddleware: RequestHandler;
  listSavedIdeasUseCase: ListSavedIdeasUseCase;
  addSavedIdeaUseCase: AddSavedIdeaUseCase;
  deleteSavedIdeaUseCase: DeleteSavedIdeaUseCase;
}

export function createSavedIdeaRouter(savedIdeaRouterDependencies: SavedIdeaRouterDependencies) {
  const savedIdeaRouter = Router();
  savedIdeaRouter.get(
    '/people/:personId/savedideas',
    savedIdeaRouterDependencies.authenticationMiddleware,
    createListSavedIdeasController(savedIdeaRouterDependencies.listSavedIdeasUseCase),
  );
  savedIdeaRouter.post(
    '/people/:personId/savedideas',
    savedIdeaRouterDependencies.authenticationMiddleware,
    createAddSavedIdeaController(savedIdeaRouterDependencies.addSavedIdeaUseCase),
  );
  savedIdeaRouter.delete(
    '/people/:personId/savedideas/:id',
    savedIdeaRouterDependencies.authenticationMiddleware,
    createDeleteSavedIdeaController(savedIdeaRouterDependencies.deleteSavedIdeaUseCase),
  );
  return savedIdeaRouter;
}
