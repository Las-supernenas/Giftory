import 'dotenv/config';
import { RegisterUserUseCase } from './domain/user/use-cases/RegisterUserUseCase';
import { SecurityServiceImplementation } from './infrastructure/services/SecurityServiceImplementation';
import { PrismaUserRepository } from './infrastructure/user/repositories/PrismaUserRepository';
import { createApi } from './ui/api';

const PORT = Number(process.env.PORT ?? 3000);

const userRepository = new PrismaUserRepository();
const securityService = new SecurityServiceImplementation();
const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  securityService,
);

const api = createApi(registerUserUseCase);

api.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
