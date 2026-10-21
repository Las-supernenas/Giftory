import assert from 'node:assert/strict';
import { test } from 'node:test';

import { RecommendationProviderResponseError } from '../../../src/domain/errors/RecommendationProviderResponseError';
import { RecommendationProviderTimeoutError } from '../../../src/domain/errors/RecommendationProviderTimeoutError';
import { RecommendationProviderUnavailableError } from '../../../src/domain/errors/RecommendationProviderUnavailableError';
import type { RecommendationAIInput } from '../../../src/domain/person/services/GiftRecommendationService';
import { OpenRouterRecommendationService } from '../../../src/infrastructure/services/OpenRouterRecommendationService';

const input: RecommendationAIInput = {
  interests: ['COOKING'],
  ageRange: '30-40',
  occasion: 'Cumpleaños',
  additionalInfo: 'Le gusta cocinar.',
  giftIdeas: [
    { id: 1, name: 'Libro de recetas', price: 20, description: 'Recetas para principiantes.' },
    { id: 2, name: 'Curso de cocina', price: 50, description: null },
  ],
};

const recommendation = {
  giftIdeaId: 1,
  matchScore: 95,
  reason: 'Le ayudará a descubrir recetas nuevas.',
};

function openRouterResponse(content: unknown): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(content) } }],
    }),
    { status: 200 },
  );
}

test('sends the eligible catalog and returns valid recommendations with one provider request', async (t) => {
  const expected = [
    recommendation,
    { giftIdeaId: 2, matchScore: 80, reason: 'Disfrutará aprendiendo técnicas nuevas.' },
  ];
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    openRouterResponse({ recommendations: expected }),
  );

  const result = await new OpenRouterRecommendationService('test-key').recommend(input);

  assert.deepEqual(result, expected);
  assert.equal(fetchMock.mock.callCount(), 1);

  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(options?.method, 'POST');
  assert.deepEqual(options?.headers, {
    Authorization: 'Bearer test-key',
    'Content-Type': 'application/json',
  });
  assert.ok(options?.signal);

  const body = JSON.parse(String(options?.body));
  assert.equal(body.model, 'minimax/minimax-m3.1-flash:free');
  assert.deepEqual(body.response_format, { type: 'json_object' });
  assert.match(body.messages[0].content, /Spanish/);
  assert.deepEqual(JSON.parse(body.messages[1].content), input);
});

test('accepts an empty recommendation list', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    openRouterResponse({ recommendations: [] }),
  );

  const result = await new OpenRouterRecommendationService('test-key').recommend(input);

  assert.deepEqual(result, []);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('rejects malformed outer JSON without retrying', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    new Response('{', { status: 200 }),
  );

  await assert.rejects(
    new OpenRouterRecommendationService('test-key').recommend(input),
    RecommendationProviderResponseError,
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});

for (const [name, payload] of [
  ['missing choices', {}],
  ['empty choices', { choices: [] }],
  ['missing message', { choices: [{}] }],
  ['non-string content', { choices: [{ message: { content: null } }] }],
  ['blank content', { choices: [{ message: { content: '   ' } }] }],
] as const) {
  test(`rejects provider envelope with ${name}`, async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      new Response(JSON.stringify(payload), { status: 200 }),
    );

    await assert.rejects(
      new OpenRouterRecommendationService('test-key').recommend(input),
      RecommendationProviderResponseError,
    );
    assert.equal(fetchMock.mock.callCount(), 1);
  });
}

test('rejects malformed recommendation JSON', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    new Response(JSON.stringify({ choices: [{ message: { content: '{' } }] }), {
      status: 200,
    }),
  );

  await assert.rejects(
    new OpenRouterRecommendationService('test-key').recommend(input),
    RecommendationProviderResponseError,
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});

for (const [name, content] of [
  ['an array instead of an object', []],
  ['a missing recommendations array', {}],
  ['a non-array recommendations value', { recommendations: null }],
  ['more than five results', { recommendations: Array(6).fill(recommendation) }],
  ['a null item', { recommendations: [null] }],
  ['an array item', { recommendations: [[recommendation]] }],
  ['a missing field', { recommendations: [{ giftIdeaId: 1, matchScore: 95 }] }],
  ['a zero ID', { recommendations: [{ ...recommendation, giftIdeaId: 0 }] }],
  ['a fractional ID', { recommendations: [{ ...recommendation, giftIdeaId: 1.5 }] }],
  ['an unsafe integer ID', {
    recommendations: [{ ...recommendation, giftIdeaId: Number.MAX_SAFE_INTEGER + 1 }],
  }],
  ['a duplicate ID', { recommendations: [recommendation, recommendation] }],
  ['a negative score', { recommendations: [{ ...recommendation, matchScore: -1 }] }],
  ['a score over 100', { recommendations: [{ ...recommendation, matchScore: 101 }] }],
  ['a fractional score', { recommendations: [{ ...recommendation, matchScore: 1.5 }] }],
  ['a blank reason', { recommendations: [{ ...recommendation, reason: '  ' }] }],
  ['a non-string reason', { recommendations: [{ ...recommendation, reason: 123 }] }],
] as const) {
  test(`rejects the complete response with ${name}`, async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => openRouterResponse(content));

    await assert.rejects(
      new OpenRouterRecommendationService('test-key').recommend(input),
      RecommendationProviderResponseError,
    );
    assert.equal(fetchMock.mock.callCount(), 1);
  });
}

test('maps an unsuccessful provider response to an unavailable error without retrying', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    new Response('Provider details must not reach the client', { status: 429 }),
  );

  await assert.rejects(
    new OpenRouterRecommendationService('test-key').recommend(input),
    RecommendationProviderUnavailableError,
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('maps a network failure to an unavailable error without retrying', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Private network details');
  });

  await assert.rejects(
    new OpenRouterRecommendationService('test-key').recommend(input),
    RecommendationProviderUnavailableError,
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('maps a request timeout to a timeout error without retrying', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new DOMException('Request timed out', 'TimeoutError');
  });

  await assert.rejects(
    new OpenRouterRecommendationService('test-key').recommend(input),
    RecommendationProviderTimeoutError,
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('maps a timeout while reading the response body to a timeout error', async (t) => {
  const response = new Response('{}', { status: 200 });
  t.mock.method(response, 'json', async () => {
    throw new DOMException('Body read aborted', 'AbortError');
  });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => response);

  await assert.rejects(
    new OpenRouterRecommendationService('test-key').recommend(input),
    RecommendationProviderTimeoutError,
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});
