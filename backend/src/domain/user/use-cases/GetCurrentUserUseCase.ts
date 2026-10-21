import { UnauthorizedError } from '../../errors/UnauthorizedError';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../User';

// Returns the logged-in user from the id stored in the session token.
// If the user no longer exists, the session is not valid anymore: 401, not 404,
// so the frontend treats it as "logged out".
export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError('La sesión ya no es válida.');
    }

    return user;
  }
}
