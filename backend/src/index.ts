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

environmentService.load();
const { PORT, JWT_SECRET } = environmentService.get();

// composition root: here we create the real implementatios

const userRepository = new PrismaUserRepository();
const personRepository = new PrismaPersonRepository();
const giftIdeaRepository = new PrismaGiftIdeaRepository();
const securityService = new SecurityServiceImplementation(JWT_SECRET);
const authenticationMiddleware = createAuthenticationMiddleware(securityService);

const registerUserUseCase = new RegisterUserUseCase(userRepository, securityService);
const loginUserUseCase = new LoginUserUseCase(userRepository, securityService);

const listPeopleUseCase = new ListPeopleUseCase(personRepository);
const createPersonUseCase = new CreatePersonUseCase(personRepository);
const updatePersonUseCase = new UpdatePersonUseCase(personRepository);
const deletePersonUseCase = new DeletePersonUseCase(personRepository);

const createGiftIdeaUseCase = new CreateGiftIdeaUseCase(giftIdeaRepository);
const getGiftIdeaUseCase = new GetGiftIdeaUseCase(giftIdeaRepository);
const listGiftIdeaUseCase = new ListGiftIdeaUseCase(giftIdeaRepository);


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
});

api.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
