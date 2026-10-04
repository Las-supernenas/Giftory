import { UnauthorizedError } from '../../errors/UnauthorizedError';
import { SecurityService } from '../../services/SecurityService';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../User';

export interface LoginUserUseCaseInput {
  email: string;
  password: string;
}

// Login returns the user's public data along with the token, so the frontend can show
// who is logged in (their name) without an extra request: the token only contains
// the userId.

export interface LoginUserUseCaseOutput {
  accessToken: string;
  user: User;
}

// Same message for unknown email and wrong password,
// so the API does not reveal which emails are registered
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly securityService: SecurityService,
  ) {}

  async execute(input: LoginUserUseCaseInput): Promise<LoginUserUseCaseOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordValid = await this.securityService.comparePasswords(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const accessToken = this.securityService.generateToken(user.id);

    return { accessToken, user };
  }
}
