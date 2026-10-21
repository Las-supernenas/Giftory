import { CreateUserInput, UserRepository } from '../../../domain/user/repositories/UserRepository';
import { User } from '../../../domain/user/User';
import { prisma } from '../../prisma-client';

export class PrismaUserRepository implements UserRepository {
  private readonly prisma = prisma;

  async create(params: CreateUserInput): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: {
        name: params.name,
        email: params.email,
        passwordHash: params.passwordHash,
      },
    });

    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!prismaUser) {
      return null;
    }

    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
    });
  }

  async findById(id: number): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!prismaUser) {
      return null;
    }

    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
    });
  }
}
