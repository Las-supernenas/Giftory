import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextFunction, Request, Response } from 'express';

import { createGetSessionController } from '../../../src/ui/user/controllers/get-session-controller';
import { GetCurrentUserUseCase } from '../../../src/domain/user/use-cases/GetCurrentUserUseCase';
import { User } from '../../../src/domain/user/User';

// fake response: no Express server, no database. Remembers what the controller sent
function createFakeResponse(userId: number) {
  let statusCode: number | undefined;
  let jsonBody: unknown;
  const headers: Record<string, string> = {};

  const res = {
    locals: { userId },
    set(name: string, value: string) {
      headers[name] = value;
      return this;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      jsonBody = body;
      return this;
    },
  } as unknown as Response;

  return {
    res,
    getStatus: () => statusCode,
    getJson: () => jsonBody,
    getHeader: (name: string) => headers[name],
  };
}

test('GET /session returns only id and name, never the email or the password hash', async () => {
  const user = new User({
    id: 1,
    name: 'Ana',
    email: 'ana@example.com',
    passwordHash: 'hashed-password',
  });
  const useCase = { execute: async () => user } as unknown as GetCurrentUserUseCase;
  const { res, getStatus, getJson, getHeader } = createFakeResponse(1);
  let nextError: unknown;
  const next: NextFunction = (error?: unknown) => {
    nextError = error;
  };

  await createGetSessionController(useCase)({} as Request, res, next);

  assert.equal(nextError, undefined);
  assert.equal(getStatus(), 200);
  // deepEqual fails if any extra field (email, passwordHash) is added to the response
  assert.deepEqual(getJson(), { id: 1, name: 'Ana' });
  assert.equal(getHeader('Cache-Control'), 'no-store');
});
