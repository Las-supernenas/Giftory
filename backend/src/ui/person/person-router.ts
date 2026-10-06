import { RequestHandler, Router } from 'express';
import { CreatePersonUseCase } from '../../domain/person/use-cases/CreatePersonUseCase';
import { DeletePersonUseCase } from '../../domain/person/use-cases/DeletePersonUseCase';
import { ListPeopleUseCase } from '../../domain/person/use-cases/ListPeopleUseCase';
import { UpdatePersonUseCase } from '../../domain/person/use-cases/UpdatePersonUseCase';
import { createCreatePersonController } from './controllers/create-person-controller';
import { createDeletePersonController } from './controllers/delete-person-controller';
import { createListPeopleController } from './controllers/list-people-controller';
import { createUpdatePersonController } from './controllers/update-person-controller';

// everything the People router needs. All of it is created once in index.ts
export interface PersonRouterDependencies {
  authenticationMiddleware: RequestHandler;
  listPeopleUseCase: ListPeopleUseCase;
  createPersonUseCase: CreatePersonUseCase;
  updatePersonUseCase: UpdatePersonUseCase;
  deletePersonUseCase: DeletePersonUseCase;
}

export const createPersonRouter = ({
  authenticationMiddleware,
  listPeopleUseCase,
  createPersonUseCase,
  updatePersonUseCase,
  deletePersonUseCase,
}: PersonRouterDependencies) => {
  const personRouter = Router();

  // every People route is private: without a valid token the middleware returns 401
  personRouter.use(authenticationMiddleware);

  personRouter.get('/', createListPeopleController(listPeopleUseCase)); // GET    /api/people
  personRouter.post('/', createCreatePersonController(createPersonUseCase)); // POST   /api/people
  personRouter.patch('/:id', createUpdatePersonController(updatePersonUseCase)); // PATCH  /api/people/:id
  personRouter.delete('/:id', createDeletePersonController(deletePersonUseCase)); // DELETE /api/people/:id

  return personRouter;
};
