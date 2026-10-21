import { User } from '../User';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}
