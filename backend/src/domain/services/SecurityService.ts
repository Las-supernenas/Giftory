export interface SecurityService {
  hash(value: string): Promise<string>;
  comparePasswords(plainPassword: string, passwordHash: string): Promise<boolean>;
  generateToken(userId: number): string;
}
