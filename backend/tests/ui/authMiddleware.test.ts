
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextFunction, Request, Response } from 'express';

import { createAuthenticationMiddleware } from '../../src/ui/shared/middlewares/authentication-middleware';
import { SecurityService } from '../../src/domain/services/SecurityService';
import { UnauthorizedError } from '../../src/domain/errors/UnauthorizedError';
import { AUTH_COOKIE_NAME } from '../../src/ui/user/auth-cookie';

function createTestContext(token?: string) {
  const req = {
    cookies: token === undefined ? {} : { [AUTH_COOKIE_NAME]: token },
  } as Request;

  const res = {
    locals: {},
  } as Response;

  let nextCalls = 0;
  let nextError: unknown;

  const next: NextFunction = (error?: unknown) => {
    nextCalls++;
    nextError = error;
  };

  return {
    req,
    res,
    next,
    getNextCalls: () => nextCalls,
    getNextError: () => nextError,
  };
}

test('allows authentication with a valid JWT cookie', () => {
  const context = createTestContext('valid-token');

  let verifiedToken: string | undefined;

  const securityService = {
    verifyToken: (token: string) => {
      verifiedToken = token;
      return 1;
    },
  } as SecurityService;

  const middleware = createAuthenticationMiddleware(securityService);

  middleware(context.req, context.res, context.next);

  assert.equal(verifiedToken, 'valid-token');
  assert.equal(context.res.locals.userId, 1);
  assert.equal(context.getNextCalls(), 1);
  assert.equal(context.getNextError(), undefined);
});

test('rejects authentication when the cookie is missing', () => {
  const context = createTestContext();

  let verifyCalls = 0;

  const securityService = {
    verifyToken: () => {
      verifyCalls++;
      return 1;
    },
  } as unknown as SecurityService;

  const middleware = createAuthenticationMiddleware(securityService);

  middleware(context.req, context.res, context.next);

  assert.equal(verifyCalls, 0);
  assert.equal(context.getNextCalls(), 1);
  assert.ok(context.getNextError() instanceof UnauthorizedError);
  assert.equal(context.res.locals.userId, undefined);
});

test('rejects authentication when the JWT is invalid', () => {
  const context = createTestContext('invalid-token');

  const verificationError = new UnauthorizedError('Invalid authentication token.');

  const securityService = {
    verifyToken: () => {
      throw verificationError;
    },
  } as unknown as SecurityService;

  const middleware = createAuthenticationMiddleware(securityService);

  middleware(context.req, context.res, context.next);

  assert.equal(context.getNextCalls(), 1);
  assert.equal(context.getNextError(), verificationError);
  assert.equal(context.res.locals.userId, undefined);
});
