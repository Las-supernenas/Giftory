import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextFunction, Request, Response } from 'express';

import { createGetGiftRecommendationsController } from '../../../src/ui/person/controllers/get-gift-recommendations-controller';
import { errorHandlerMiddleware } from '../../../src/ui/shared/middlewares/error-handler-middleware';
import { RecommendationResponse } from '../../../src/domain/person/recommendation-types';
import { GetGiftRecommendationsUseCaseInput } from '../../../src/domain/person/use-cases/GetGiftRecommendationsUseCaseInput';
import { EntityNotFoundError } from '../../../src/domain/errors/EntityNotFoundError';
import { RecommendationProviderResponseError } from '../../../src/domain/errors/RecommendationProviderResponseError';
import { RecommendationProviderTimeoutError } from '../../../src/domain/errors/RecommendationProviderTimeoutError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { ValidationError } from '../../../src/domain/errors/ValidationError';

const RECOMMENDATIONS: RecommendationResponse = {
  recommendations: [
    {
      giftIdeaId: 3,
      name: 'Ajedrez de mármol',
      price: 45,
      imageFilename: null,
      productUrl: null,
      matchScore: 92,
      reason: 'Le encantan los juegos de mesa.',
    },
  ],
};

//fake request/response/next: no Express server, no database, no AI
function createTestContext(options: { params?: unknown; body?: unknown; userId?: number }) {
  const req = {
    params: options.params ?? { id: '10' },
    body: options.body ?? {},
  } as unknown as Request;

  let statusCode: number | undefined;
  let jsonBody: unknown;

  const res = {
    locals: options.userId === undefined ? {} : { userId: options.userId },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      jsonBody = body;
      return this;
    },
  } as unknown as Response;

  let nextError: unknown;
  const next: NextFunction = (error?: unknown) => {
    nextError = error;
  };

  return {
    req,
    res,
    next,
    getStatus: () => statusCode,
    getJson: () => jsonBody,
    getNextError: () => nextError,
  };
}

// mocked use case: remembers what it received and returns (or throws) what the test decides
function createFakeUseCase(result: RecommendationResponse | Error = RECOMMENDATIONS) {
  let receivedInput: GetGiftRecommendationsUseCaseInput | undefined;
  let executeCalls = 0;

  const useCase = {
    execute: async (input: GetGiftRecommendationsUseCaseInput) => {
      executeCalls++;
      receivedInput = input;
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
  };

  return {
    useCase,
    getReceivedInput: () => receivedInput,
    getExecuteCalls: () => executeCalls,
  };
}

// --- success ---

test('returns 200 with the recommendations for a valid request', async () => {
  const fake = createFakeUseCase();
  const context = createTestContext({
    userId: 1,
    body: {
      budget: 50,
      ageRange: '30-40',
      occasion: 'Cumpleaños',
      additionalInfo: 'Le gusta el ajedrez',
    },
  });

  await createGetGiftRecommendationsController(fake.useCase)(
    context.req,
    context.res,
    context.next,
  );

  assert.equal(context.getStatus(), 200);
  assert.deepEqual(context.getJson(), RECOMMENDATIONS);
  assert.deepEqual(fake.getReceivedInput(), {
    userId: 1,
    personId: 10,
    budget: 50,
    ageRange: '30-40',
    occasion: 'Cumpleaños',
    additionalInfo: 'Le gusta el ajedrez',
  });
  assert.equal(context.getNextError(), undefined);
});

test('accepts a request with every optional field omitted', async () => {
  const fake = createFakeUseCase();
  const context = createTestContext({ userId: 1, body: {} });

  await createGetGiftRecommendationsController(fake.useCase)(
    context.req,
    context.res,
    context.next,
  );

  assert.equal(context.getStatus(), 200);
  assert.deepEqual(fake.getReceivedInput(), {
    userId: 1,
    personId: 10,
    budget: undefined,
    ageRange: undefined,
    occasion: undefined,
    additionalInfo: undefined,
  });
});

test('passes a valid budget to the use case as a number', async () => {
  const fake = createFakeUseCase();
  const context = createTestContext({ userId: 1, body: { budget: 25.5 } });

  await createGetGiftRecommendationsController(fake.useCase)(
    context.req,
    context.res,
    context.next,
  );

  assert.equal(fake.getReceivedInput()?.budget, 25.5);
});

test('returns 200 when the recommendation list is empty', async () => {
  const fake = createFakeUseCase({ recommendations: [] });
  const context = createTestContext({ userId: 1 });

  await createGetGiftRecommendationsController(fake.useCase)(
    context.req,
    context.res,
    context.next,
  );

  assert.equal(context.getStatus(), 200);
  assert.deepEqual(context.getJson(), { recommendations: [] });
});

// --- authentication ---

test('rejects the request when there is no authenticated user', async () => {
  const fake = createFakeUseCase();
  const context = createTestContext({});

  await createGetGiftRecommendationsController(fake.useCase)(
    context.req,
    context.res,
    context.next,
  );

  assert.ok(context.getNextError() instanceof UnauthorizedError);
  assert.equal(fake.getExecuteCalls(), 0);
});

test('uses the authenticated userId and ignores a userId sent in the body', async () => {
  const fake = createFakeUseCase();
  const context = createTestContext({ userId: 1, body: { userId: 999 } });

  await createGetGiftRecommendationsController(fake.useCase)(
    context.req,
    context.res,
    context.next,
  );

  assert.equal(fake.getReceivedInput()?.userId, 1);
});

// --- validation (400) ---

const invalidRequests = [
  { name: 'budget is 0', params: { id: '10' }, body: { budget: 0 } },
  { name: 'budget is negative', params: { id: '10' }, body: { budget: -5 } },
  { name: 'budget is a string', params: { id: '10' }, body: { budget: '50' } },
  {
    name: 'additionalInfo is longer than 1000 characters',
    params: { id: '10' },
    body: { additionalInfo: 'a'.repeat(1001) },
  },
  { name: 'person id is not a number', params: { id: 'abc' }, body: {} },
  { name: 'person id is 0', params: { id: '0' }, body: {} },
];

for (const invalidRequest of invalidRequests) {
  test(`rejects the request when ${invalidRequest.name}`, async () => {
    const fake = createFakeUseCase();
    const context = createTestContext({
      userId: 1,
      params: invalidRequest.params,
      body: invalidRequest.body,
    });

    await createGetGiftRecommendationsController(fake.useCase)(
      context.req,
      context.res,
      context.next,
    );

    assert.ok(context.getNextError() instanceof ValidationError);
    assert.equal(fake.getExecuteCalls(), 0);
  });
}

// --- errors from the use case go through the existing error middleware ---

const useCaseErrors = [
  {
    name: 'person not accessible',
    error: new EntityNotFoundError('Person', '10'),
    expectedStatus: 404,
  },
  {
    name: 'invalid provider response',
    error: new RecommendationProviderResponseError(),
    expectedStatus: 502,
  },
  {
    name: 'provider timeout',
    error: new RecommendationProviderTimeoutError(),
    expectedStatus: 504,
  },
];

for (const useCaseError of useCaseErrors) {
  test(`returns ${useCaseError.expectedStatus} when the use case fails with ${useCaseError.name}`, async () => {
    const fake = createFakeUseCase(useCaseError.error);
    const context = createTestContext({ userId: 1 });

    await createGetGiftRecommendationsController(fake.useCase)(
      context.req,
      context.res,
      context.next,
    );

    // the controller does not answer: it passes the error to next()
    assert.equal(context.getNextError(), useCaseError.error);

    // the existing middleware translates it to the HTTP status and { error: string }
    const errorContext = createTestContext({});
    errorHandlerMiddleware(
      context.getNextError(),
      errorContext.req,
      errorContext.res,
      errorContext.next,
    );

    assert.equal(errorContext.getStatus(), useCaseError.expectedStatus);
    assert.deepEqual(errorContext.getJson(), { error: useCaseError.error.message });
  });
}

test('returns 400 through the error middleware when validation fails', async () => {
  const fake = createFakeUseCase();
  const context = createTestContext({ userId: 1, body: { budget: 0 } });

  await createGetGiftRecommendationsController(fake.useCase)(
    context.req,
    context.res,
    context.next,
  );

  const errorContext = createTestContext({});
  errorHandlerMiddleware(
    context.getNextError(),
    errorContext.req,
    errorContext.res,
    errorContext.next,
  );

  assert.equal(errorContext.getStatus(), 400);
  assert.deepEqual(errorContext.getJson(), { error: 'El presupuesto debe ser mayor que 0.' });
});
