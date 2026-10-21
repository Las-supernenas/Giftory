import assert from 'node:assert/strict';
import { test } from 'node:test';

import { GetCurrentUserUseCase } from '../../../src/domain/user/use-cases/GetCurrentUserUseCase';
import { UserRepository } from '../../../src/domain/user/repositories/UserRepository';
import { User } from '../../../src/domain/user/User';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';

function createFakeUser(id = 1): User {
  return new User({
    id,
    name: 'Julia',
    email: 'julia@example.com',
    passwordHash: 'hashed-password',
  });
}

// Only findById is needed by this use case
function createFakeUserRepository(user: User | null): UserRepository {
  return {
    findById: async (id: number) => (user && user.id === id ? user : null),
  } as UserRepository;
}

test('GetCurrentUserUseCase returns the user when it exists', async () => {
  const user = createFakeUser(1);
  const useCase = new GetCurrentUserUseCase(createFakeUserRepository(user));

  const result = await useCase.execute(1);

  assert.equal(result.id, 1);
  assert.equal(result.name, 'Julia');
});

test('GetCurrentUserUseCase throws UnauthorizedError when the user does not exist', async () => {
  const useCase = new GetCurrentUserUseCase(createFakeUserRepository(null));

  await assert.rejects(() => useCase.execute(99), UnauthorizedError);
});
