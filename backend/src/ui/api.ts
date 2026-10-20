import express from 'express';
import cookieParser from 'cookie-parser';
import { healthRouter } from './shared/routes/health-route';
import { notFoundMiddleware } from './shared/middlewares/not-found-middleware';
import { errorHandlerMiddleware } from './shared/middlewares/error-handler-middleware';
import { createUserRouter } from './user/user-router';
import { createPersonRouter } from './person/person-router';
import { createGiftIdeaRouter } from './giftidea/giftidea-router';
import { LoginUserUseCase } from '../domain/user/use-cases/LoginUserUseCase';
import { RegisterUserUseCase } from '../domain/user/use-cases/RegisterUserUseCase';
import type { RequestHandler } from 'express';
import { CreatePersonUseCase } from '../domain/person/use-cases/CreatePersonUseCase';
import { DeletePersonUseCase } from '../domain/person/use-cases/DeletePersonUseCase';
import { ListPeopleUseCase } from '../domain/person/use-cases/ListPeopleUseCase';
import { UpdatePersonUseCase } from '../domain/person/use-cases/UpdatePersonUseCase';
import { CreateGiftIdeaUseCase } from '../domain/giftidea/use-cases/CreateGiftIdeaUseCase';
import { GetGiftIdeaUseCase } from '../domain/giftidea/use-cases/GetGiftIdeaUseCase';
import { ListGiftIdeaUseCase } from '../domain/giftidea/use-cases/ListGiftIdeaUseCase';
import { UpdateGiftIdeaUseCase } from '../domain/giftidea/use-cases/UpdateGiftIdeaUseCase';
import { createLibraryRouter } from './library/library-router';
import { ListLibraryItemsUseCase } from '../domain/library/use-cases/ListLibraryItemsUseCase';
import { AddLibraryItemUseCase } from '../domain/library/use-cases/AddLibraryItemUseCase';
import { DeleteLibraryItemUseCase } from '../domain/library/use-cases/DeleteLibraryItemUseCase';
import { interestsRouter } from './shared/routes/interests-route';
import { createEventRouter } from './event/event-router';
import { ListEventsUseCase } from '../domain/event/use-cases/ListEventsUseCase';
import { CreateEventUseCase } from '../domain/event/use-cases/CreateEventUseCase';
import { UpdateEventUseCase } from '../domain/event/use-cases/UpdateEventUseCase';
import { DeleteEventUseCase } from '../domain/event/use-cases/DeleteEventUseCase';
import { createSavedIdeaRouter } from './savedidea/savedidea-router';
import { ListSavedIdeasUseCase } from '../domain/savedidea/use-cases/ListSavedIdeasUseCase';
import { AddSavedIdeaUseCase } from '../domain/savedidea/use-cases/AddSavedIdeaUseCase';
import { DeleteSavedIdeaUseCase } from '../domain/savedidea/use-cases/DeleteSavedIdeaUseCase';
import { UpdateSavedIdeaPrivateNoteUseCase } from '../domain/savedidea/use-cases/UpdateSavedIdeaPrivateNoteUseCase';
import { UpdateGiftIdeaImageUseCase } from '../domain/giftidea/use-cases/UpdateGiftIdeaImageUseCase';

// All the use cases the HTTP layer needs. Created in index.ts and passed to the routers.
// When a new use case is added, add it here too.

export interface ApiDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  authenticationMiddleware: RequestHandler;
  cookieSecure: boolean;
  listPeopleUseCase: ListPeopleUseCase;
  createPersonUseCase: CreatePersonUseCase;
  updatePersonUseCase: UpdatePersonUseCase;
  deletePersonUseCase: DeletePersonUseCase;
  createGiftIdeaUseCase: CreateGiftIdeaUseCase;
  getGiftIdeaUseCase: GetGiftIdeaUseCase;
  listGiftIdeaUseCase: ListGiftIdeaUseCase;
  updateGiftIdeaUseCase: UpdateGiftIdeaUseCase;
  listLibraryItemsUseCase: ListLibraryItemsUseCase;
  addLibraryItemUseCase: AddLibraryItemUseCase;
  deleteLibraryItemUseCase: DeleteLibraryItemUseCase;
  listEventsUseCase: ListEventsUseCase;
  createEventUseCase: CreateEventUseCase;
  updateEventUseCase: UpdateEventUseCase;
  deleteEventUseCase: DeleteEventUseCase;
  listSavedIdeasUseCase: ListSavedIdeasUseCase;
  addSavedIdeaUseCase: AddSavedIdeaUseCase;
  deleteSavedIdeaUseCase: DeleteSavedIdeaUseCase;
  updatePrivateNoteUseCase: UpdateSavedIdeaPrivateNoteUseCase;
  updateGiftIdeaImageUseCase: UpdateGiftIdeaImageUseCase;
}

export const createApi = (dependencies: ApiDependencies) => {
  const api = express();

  api.use(express.json());
  api.use(cookieParser());

  api.use('/api', healthRouter);
  api.use('/api', interestsRouter);
  api.use('/api/users', createUserRouter(dependencies));
  api.use('/api/people', createPersonRouter(dependencies));
  api.use('/api/giftideas', createGiftIdeaRouter(dependencies));
  api.use('/api/library', createLibraryRouter(dependencies));
  api.use('/api', createEventRouter(dependencies));
  api.use('/api', createSavedIdeaRouter(dependencies));

  api.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  api.use(notFoundMiddleware);
  api.use(errorHandlerMiddleware);

  return api;
};
