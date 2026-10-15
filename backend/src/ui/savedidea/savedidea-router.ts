import { RequestHandler, Router } from 'express';
import { ListSavedIdeasUseCase } from '../../domain/savedidea/use-cases/ListSavedIdeasUseCase';
import { AddSavedIdeaUseCase } from '../../domain/savedidea/use-cases/AddSavedIdeaUseCase';
import { DeleteSavedIdeaUseCase } from '../../domain/savedidea/use-cases/DeleteSavedIdeaUseCase';
import { createListSavedIdeasController } from './controllers/list-saved-ideas-controller';
import { createAddSavedIdeaController } from './controllers/add-saved-idea-controller';
import { createDeleteSavedIdeaController } from './controllers/delete-saved-idea-controller';
import { UpdateSavedIdeaPrivateNoteUseCase } from '../../domain/savedidea/use-cases/UpdateSavedIdeaPrivateNoteUseCase';
import { createUpdateSavedIdeaPrivateNoteController } from './controllers/update-saved-idea-private-note-controller';

export interface SavedIdeaRouterDependencies {
  authenticationMiddleware: RequestHandler;
  listSavedIdeasUseCase: ListSavedIdeasUseCase;
  addSavedIdeaUseCase: AddSavedIdeaUseCase;
  deleteSavedIdeaUseCase: DeleteSavedIdeaUseCase;
  updatePrivateNoteUseCase: UpdateSavedIdeaPrivateNoteUseCase;
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
  savedIdeaRouter.patch(
    '/people/:personId/savedideas/:id',
    savedIdeaRouterDependencies.authenticationMiddleware,
    createUpdateSavedIdeaPrivateNoteController(
      savedIdeaRouterDependencies.updatePrivateNoteUseCase,
    ),
  );
  savedIdeaRouter.delete(
    '/people/:personId/savedideas/:id',
    savedIdeaRouterDependencies.authenticationMiddleware,
    createDeleteSavedIdeaController(savedIdeaRouterDependencies.deleteSavedIdeaUseCase),
  );
  return savedIdeaRouter;
}
