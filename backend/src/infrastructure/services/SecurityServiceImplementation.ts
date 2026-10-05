import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';

import { SecurityService } from '../../domain/services/SecurityService';

const TOKEN_EXPIRATION = '5d'; //expires in 5 days from login

export class SecurityServiceImplementation implements SecurityService {
  // the secret is injected from index.ts
  constructor(private readonly jwtSecret: string) {}

  async hash(value: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value, salt);

    return hashedPassword;
  }

  comparePasswords(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  generateToken(userId: number): string {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: TOKEN_EXPIRATION });
  }

  verifyToken(token: string): number {
    try {
      const payload = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      });

      if (typeof payload === 'string') {
        throw new UnauthorizedError('Invalid or expired token.');
      }

      const userId = payload.userId;

      if (typeof userId !== 'number') {
        throw new UnauthorizedError('Invalid or expired token.');
      }

      const isValidUserId = Number.isSafeInteger(userId) && userId > 0;

      if (!isValidUserId) {
        throw new UnauthorizedError('Invalid or expired token.');
      }

      return userId;
    } catch {
      throw new UnauthorizedError('Invalid or expired token.');
    }
  }
}
