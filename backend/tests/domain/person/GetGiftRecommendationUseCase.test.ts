import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { GetGiftRecommendationsUseCase } from '../../../src/domain/person/use-cases/GetGiftRecommendationsUseCase';
import { EntityNotFoundError } from '../../../src/domain/errors/EntityNotFoundError';
import { RecommendationProviderResponseError } from '../../../src/domain/errors/RecommendationProviderResponseError';
import { RecommendationProviderTimeoutError } from '../../../src/domain/errors/RecommendationProviderTimeoutError';

import type { PersonRepository } from '../../../src/domain/person/repositories/PersonRepository';
import type { GiftIdeaRepository } from '../../../src/domain/giftidea/repositories/GiftIdeaRepository';
import type {
  AIRecommendation,
  RecommendationAIInput,
  GiftRecommendationService,
} from '../../../src/domain/person/services/GiftRecommendationService';

const USER_ID = 1;
const PERSON_ID = 10;

type Person = NonNullable<Awaited<ReturnType<PersonRepository['findByIdAndUserId']>>>;

type GiftIdea = Awaited<ReturnType<GiftIdeaRepository['findAll']>>[number];

const person: Person = {
  id: PERSON_ID,
  userId: USER_ID,
  name: 'Ana',
  interests: [],
};

const giftIdeas: GiftIdea[] = [
  {
    id: 1,
    userId: USER_ID,
    name: 'Camera',
    price: 80,
    description: 'Digital camera',
    interests: [],
    deletedAt: null,
  },
  {
    id: 2,
    userId: USER_ID,
    name: 'Photography Book',
    price: 20,
    description: 'Beginner photography guide',
    interests: [],
    deletedAt: null,
  },
  {
    id: 3,
    userId: USER_ID,
    name: 'Tripod',
    price: 50,
    description: 'Portable camera tripod',
    interests: [],
    deletedAt: null,
  },
];

function setup({
  foundPerson = person,
  availableGiftIdeas = giftIdeas,
  aiResult = [],
  aiError,
}: {
  foundPerson?: Person | null;
  availableGiftIdeas?: GiftIdea[];
  aiResult?: unknown;
  aiError?: Error;
} = {}) {
  const calls = {
    personLookup: [] as Array<[number, number]>,
    aiInputs: [] as RecommendationAIInput[],
  };

  const personRepository = {
    async findByIdAndUserId(personId: number, userId: number) {
      calls.personLookup.push([personId, userId]);
      return foundPerson;
    },
  } as PersonRepository;

  const giftIdeaRepository = {
    async findAll() {
      return availableGiftIdeas;
    },
  } as GiftIdeaRepository;

  const recommendationService: GiftRecommendationService = {
    async recommend(input) {
      calls.aiInputs.push(input);

      if (aiError) {
        throw aiError;
      }

      return aiResult as AIRecommendation[];
    },
  };

  const useCase = new GetGiftRecommendationsUseCase(
    personRepository,
    giftIdeaRepository,
    recommendationService,
  );

  return { useCase, calls };
}

describe('GetGiftRecommendationsUseCase', () => {
  it('throws when the Person does not exist or is inaccessible', async () => {
    const { useCase, calls } = setup({
      foundPerson: null,
    });

    await assert.rejects(
      useCase.execute({
        personId: PERSON_ID,
        userId: USER_ID,
      }),
      EntityNotFoundError,
    );

    assert.deepEqual(calls.personLookup, [[PERSON_ID, USER_ID]]);
    assert.equal(calls.aiInputs.length, 0);
  });
  it('returns no recommendations when the catalog is empty', async () => {
    const { useCase, calls } = setup({
      availableGiftIdeas: [],
    });

    const result = await useCase.execute({
      personId: PERSON_ID,
      userId: USER_ID,
    });

    assert.deepEqual(result, { recommendations: [] });
    assert.equal(calls.aiInputs.length, 0);
  });

  it('does not call AI when no GiftIdea fits the budget', async () => {
    const { useCase, calls } = setup();

    const result = await useCase.execute({
      personId: PERSON_ID,
      userId: USER_ID,
      budget: 10,
    });

    assert.deepEqual(result, { recommendations: [] });
    assert.equal(calls.aiInputs.length, 0);
  });

  it('includes gifts priced exactly at the budget', async () => {
    const { useCase, calls } = setup();

    await useCase.execute({
      personId: PERSON_ID,
      userId: USER_ID,
      budget: 50,
    });

    assert.deepEqual(
      calls.aiInputs[0].giftIdeas.map((gift) => gift.id),
      [2, 3],
    );
  });

  it('sends the entire catalog when no budget is provided', async () => {
    const { useCase, calls } = setup();

    await useCase.execute({
      personId: PERSON_ID,
      userId: USER_ID,
    });

    assert.deepEqual(
      calls.aiInputs[0].giftIdeas.map((gift) => gift.id),
      [1, 2, 3],
    );
  });

  it('passes Person context and eligible gifts to AI', async () => {
    const { useCase, calls } = setup();

    await useCase.execute({
      personId: PERSON_ID,
      userId: USER_ID,
      budget: 80,
      ageRange: '25-35',
      occasion: 'Birthday',
      additionalInfo: 'Enjoys outdoor activities',
    });

    assert.equal(calls.aiInputs.length, 1);

    assert.deepEqual(calls.aiInputs[0], {
      interests: [],
      ageRange: '25-35',
      occasion: 'Birthday',
      additionalInfo: 'Enjoys outdoor activities',
      giftIdeas: [
        {
          id: 1,
          name: 'Camera',
          price: 80,
          description: 'Digital camera',
        },
        {
          id: 2,
          name: 'Photography Book',
          price: 20,
          description: 'Beginner photography guide',
        },
        {
          id: 3,
          name: 'Tripod',
          price: 50,
          description: 'Portable camera tripod',
        },
      ],
    });
  });

  it('sorts and enriches valid AI recommendations', async () => {
    const { useCase } = setup({
      aiResult: [
        {
          giftIdeaId: 2,
          matchScore: 70,
          reason: 'Una buena introducción a la fotografía.',
        },
        {
          giftIdeaId: 1,
          matchScore: 95,
          reason: 'Ideal para practicar fotografía.',
        },
      ],
    });

    const result = await useCase.execute({
      personId: PERSON_ID,
      userId: USER_ID,
    });

    assert.deepEqual(result, {
      recommendations: [
        {
          giftIdeaId: 1,
          name: 'Camera',
          price: 80,
          imageFilename: null,
          productUrl: null,
          matchScore: 95,
          reason: 'Ideal para practicar fotografía.',
        },
        {
          giftIdeaId: 2,
          name: 'Photography Book',
          price: 20,
          imageFilename: null,
          productUrl: null,
          matchScore: 70,
          reason: 'Una buena introducción a la fotografía.',
        },
      ],
    });
  });

  it('accepts an empty AI recommendation list', async () => {
    const { useCase } = setup({
      aiResult: [],
    });

    const result = await useCase.execute({
      personId: PERSON_ID,
      userId: USER_ID,
    });

    assert.deepEqual(result, { recommendations: [] });
  });

  const invalidResults: Array<{
    name: string;
    result: AIRecommendation[];
  }> = [
    {
      name: 'duplicate IDs',
      result: [
        { giftIdeaId: 1, matchScore: 90, reason: 'Válido' },
        { giftIdeaId: 1, matchScore: 80, reason: 'Duplicado' },
      ],
    },
    {
      name: 'unknown GiftIdea ID',
      result: [{ giftIdeaId: 999, matchScore: 90, reason: 'Desconocido' }],
    },
    {
      name: 'GiftIdea outside the budget',
      result: [{ giftIdeaId: 1, matchScore: 90, reason: 'Fuera del presupuesto' }],
    },
    {
      name: 'score above 100',
      result: [{ giftIdeaId: 1, matchScore: 101, reason: 'Puntuación inválida' }],
    },
    {
      name: 'non-integer score',
      result: [{ giftIdeaId: 1, matchScore: 85.5, reason: 'Puntuación inválida' }],
    },
    {
      name: 'empty reason',
      result: [{ giftIdeaId: 1, matchScore: 90, reason: '   ' }],
    },
    {
      name: 'more than five recommendations',
      result: Array.from({ length: 6 }, (_, index) => ({
        giftIdeaId: index + 1,
        matchScore: 90,
        reason: 'Recomendación',
      })),
    },
  ];

  for (const { name, result } of invalidResults) {
    it(`rejects ${name}`, async () => {
      const { useCase } = setup({
        aiResult: result,
        ...(name === 'more than five recommendations'
          ? {
              availableGiftIdeas: Array.from({ length: 6 }, (_, index) => ({
                ...giftIdeas[0],
                id: index + 1,
              })),
            }
          : {}),
      });

      await assert.rejects(
        useCase.execute({
          personId: PERSON_ID,
          userId: USER_ID,
          ...(name === 'GiftIdea outside the budget' ? { budget: 50 } : {}),
        }),
        RecommendationProviderResponseError,
      );
    });
  }

  it('rejects a non-array provider result', async () => {
    const { useCase } = setup({
      aiResult: { recommendations: [] },
    });

    await assert.rejects(
      useCase.execute({
        personId: PERSON_ID,
        userId: USER_ID,
      }),
      RecommendationProviderResponseError,
    );
  });

  it('propagates provider response errors', async () => {
    const error = new RecommendationProviderResponseError();

    const { useCase } = setup({
      aiError: error,
    });

    await assert.rejects(
      useCase.execute({
        personId: PERSON_ID,
        userId: USER_ID,
      }),
      (receivedError) => receivedError === error,
    );
  });

  it('propagates provider timeout errors', async () => {
    const error = new RecommendationProviderTimeoutError();

    const { useCase } = setup({
      aiError: error,
    });

    await assert.rejects(
      useCase.execute({
        personId: PERSON_ID,
        userId: USER_ID,
      }),
      (receivedError) => receivedError === error,
    );
  });
});
