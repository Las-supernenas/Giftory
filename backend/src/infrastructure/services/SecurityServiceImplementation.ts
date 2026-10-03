import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
}
