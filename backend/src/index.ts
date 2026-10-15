import { RegisterUserUseCase } from './domain/user/use-cases/RegisterUserUseCase';
import { SecurityServiceImplementation } from './infrastructure/services/SecurityServiceImplementation';
import { PrismaUserRepository } from './infrastructure/user/repositories/PrismaUserRepository';
import { createApi } from './ui/api';
import { LoginUserUseCase } from './domain/user/use-cases/LoginUserUseCase';
import { environmentService } from './infrastructure/EnvironmentService';
import { createAuthenticationMiddleware } from './ui/shared/middlewares/authentication-middleware';
import { PrismaPersonRepository } from './infrastructure/person/repositories/PrismaPersonRepository';
import { ListPeopleUseCase } from './domain/person/use-cases/ListPeopleUseCase';
import { CreatePersonUseCase } from './domain/person/use-cases/CreatePersonUseCase';
import { UpdatePersonUseCase } from './domain/person/use-cases/UpdatePersonUseCase';
import { DeletePersonUseCase } from './domain/person/use-cases/DeletePersonUseCase';
import { PrismaGiftIdeaRepository } from './infrastructure/giftidea/repositories/PrismaGiftIdeaRepository';
import { CreateGiftIdeaUseCase } from './domain/giftidea/use-cases/CreateGiftIdeaUseCase';
import { GetGiftIdeaUseCase } from './domain/giftidea/use-cases/GetGiftIdeaUseCase';
import { ListGiftIdeaUseCase } from './domain/giftidea/use-cases/ListGiftIdeaUseCase';
import { PrismaLibraryItemRepository } from './infrastructure/library/repositories/PrismaLibraryItemRepository';
import { ListLibraryItemsUseCase } from './domain/library/use-cases/ListLibraryItemsUseCase';
import { AddLibraryItemUseCase } from './domain/library/use-cases/AddLibraryItemUseCase';
import { DeleteLibraryItemUseCase } from './domain/library/use-cases/DeleteLibraryItemUseCase';
import { PrismaEventRepository } from './infrastructure/event/repositories/PrismaEventRepository';
import { ListEventsUseCase } from './domain/event/use-cases/ListEventsUseCase';
import { CreateEventUseCase } from './domain/event/use-cases/CreateEventUseCase';
import { UpdateEventUseCase } from './domain/event/use-cases/UpdateEventUseCase';
import { DeleteEventUseCase } from './domain/event/use-cases/DeleteEventUseCase';
import { PrismaSavedIdeaRepository } from './infrastructure/savedidea/repositories/PrismaSavedIdeaRepository';
import { ListSavedIdeasUseCase } from './domain/savedidea/use-cases/ListSavedIdeasUseCase';
import { AddSavedIdeaUseCase } from './domain/savedidea/use-cases/AddSavedIdeaUseCase';
import { DeleteSavedIdeaUseCase } from './domain/savedidea/use-cases/DeleteSavedIdeaUseCase';
import { UpdateSavedIdeaPrivateNoteUseCase } from './domain/savedidea/use-cases/UpdateSavedIdeaPrivateNoteUseCase';

environmentService.load();
const { PORT, JWT_SECRET } = environmentService.get();

// composition root: here we create the real implementatios

const userRepository = new PrismaUserRepository();
const personRepository = new PrismaPersonRepository();
const giftIdeaRepository = new PrismaGiftIdeaRepository();
const libraryItemRepository = new PrismaLibraryItemRepository();
const eventRepository = new PrismaEventRepository();
const securityService = new SecurityServiceImplementation(JWT_SECRET);
const authenticationMiddleware = createAuthenticationMiddleware(securityService);
const savedIdeaRepository = new PrismaSavedIdeaRepository();

const registerUserUseCase = new RegisterUserUseCase(userRepository, securityService);
const loginUserUseCase = new LoginUserUseCase(userRepository, securityService);

const listPeopleUseCase = new ListPeopleUseCase(personRepository);
const createPersonUseCase = new CreatePersonUseCase(personRepository);
const updatePersonUseCase = new UpdatePersonUseCase(personRepository);
const deletePersonUseCase = new DeletePersonUseCase(personRepository);

const createGiftIdeaUseCase = new CreateGiftIdeaUseCase(giftIdeaRepository);
const getGiftIdeaUseCase = new GetGiftIdeaUseCase(giftIdeaRepository);
const listGiftIdeaUseCase = new ListGiftIdeaUseCase(giftIdeaRepository);

const listLibraryItemsUseCase = new ListLibraryItemsUseCase(libraryItemRepository);
const addLibraryItemUseCase = new AddLibraryItemUseCase(libraryItemRepository, giftIdeaRepository);
const deleteLibraryItemUseCase = new DeleteLibraryItemUseCase(libraryItemRepository);

const listEventsUseCase = new ListEventsUseCase(eventRepository, personRepository);
const createEventUseCase = new CreateEventUseCase(eventRepository, personRepository);
const updateEventUseCase = new UpdateEventUseCase(eventRepository);
const deleteEventUseCase = new DeleteEventUseCase(eventRepository);

const listSavedIdeasUseCase = new ListSavedIdeasUseCase(personRepository, savedIdeaRepository);
const addSavedIdeaUseCase = new AddSavedIdeaUseCase(
  personRepository,
  savedIdeaRepository,
  giftIdeaRepository,
);
const deleteSavedIdeaUseCase = new DeleteSavedIdeaUseCase(personRepository, savedIdeaRepository);
const updatePrivateNoteUseCase = new UpdateSavedIdeaPrivateNoteUseCase(
  personRepository,
  savedIdeaRepository,
);

const api = createApi({
  registerUserUseCase,
  loginUserUseCase,
  authenticationMiddleware,
  listPeopleUseCase,
  createPersonUseCase,
  updatePersonUseCase,
  deletePersonUseCase,
  createGiftIdeaUseCase,
  getGiftIdeaUseCase,
  listGiftIdeaUseCase,
  listLibraryItemsUseCase,
  addLibraryItemUseCase,
  deleteLibraryItemUseCase,
  listEventsUseCase,
  createEventUseCase,
  updateEventUseCase,
  deleteEventUseCase,
  listSavedIdeasUseCase,
  addSavedIdeaUseCase,
  deleteSavedIdeaUseCase,
  updatePrivateNoteUseCase,
});

api.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
