import { UserRepository } from "../repositories/UserRepository";
import { SecurityService } from "../../services/SecurityService";
import { User } from "../User";
import { BusinessConflictError } from "../../errors/BusinessConflictError";
import { ValidationError } from "../../errors/ValidationError";
import { passwordValidator, emailValidator } from "../utils/validators";

export interface RegisterUserUseCaseInput {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  private readonly userRepository: UserRepository;
  private readonly securityService: SecurityService;

  constructor(
    userRepository: UserRepository,
    securityService: SecurityService,
  ) {
    this.userRepository = userRepository;
    this.securityService = securityService;
  }

  async execute(input: RegisterUserUseCaseInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new BusinessConflictError(
        "A user with this email already exists.",
      );
    }

    const validatedEmail = emailValidator(input.email);
    const validatedPassword = passwordValidator(input.password);

    if (!validatedEmail) {
      throw new ValidationError("Invalid email.");
    }

    if (!validatedPassword) {
      throw new ValidationError("Invalid password.");
    }

    const hashedPassword = await this.securityService.hash(input.password);

    const newUser = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword,
    });

    return newUser;
  }
}