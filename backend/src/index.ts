import { RegisterUserUseCase } from './domain/user/use-cases/RegisterUserUseCase';
import { SecurityServiceImplementation } from './infrastructure/services/SecurityServiceImplementation';
import { PrismaUserRepository } from './infrastructure/user/repositories/PrismaUserRepository';
import { createApi } from './ui/api';
import { LoginUserUseCase } from './domain/user/use-cases/LoginUserUseCase';
import { environmentService } from './infrastructure/EnvironmentService';

environmentService.load();
const { PORT, JWT_SECRET } = environmentService.get();

// composition root: here we create the real implementatios

const userRepository = new PrismaUserRepository();
const securityService = new SecurityServiceImplementation(JWT_SECRET);

const registerUserUseCase = new RegisterUserUseCase(userRepository, securityService);
const loginUserUseCase = new LoginUserUseCase(userRepository, securityService);

const api = createApi({ registerUserUseCase, loginUserUseCase });

api.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
