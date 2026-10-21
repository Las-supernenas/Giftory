# Gift recommendation contracts

This document and the backend/frontend TypeScript types define the handoff contracts. They do not implement the endpoint, use case, UI, or provider adapter.

## HTTP contract

- `POST /api/people/:id/recommendations` requires authentication.
- `:id` is a positive integer person ID; the user ID comes from authentication, never the request body.
- The optional request body is `RecommendationRequest` in the backend and frontend type files: `budget`, `ageRange`, `occasion`, and `additionalInfo`.
- `budget`, when present, must be finite and greater than zero. Budget filtering is inclusive (`price <= budget`). `additionalInfo` is at most 1,000 characters. `ageRange` and `occasion` are optional free-text strings.
- Success is `200` with `RecommendationResponse`: `{ "recommendations": [...] }`. Each item has `giftIdeaId`, `name`, `price`, `matchScore`, and `reason`.
- The response contains zero to five recommendations. Empty eligible catalog and a valid empty AI array both produce `200 { "recommendations": [] }`.
- Errors retain the existing `{ "error": string }` response shape. Invalid HTTP input is `400`; a person the authenticated user cannot access is `404`; invalid provider output is `502`; provider timeout is `504`.

## Domain and provider contract

- `GetGiftRecommendationsUseCaseInput` combines `userId`, `personId`, and the validated optional request fields.
- `GiftRecommendationService.recommend` accepts `RecommendationAIInput` and returns `AIRecommendation[]`.
- `RecommendationAIInput` contains the person's `Interest[]`, supplied optional preferences, and all active budget-eligible catalog items. Each `RecommendationGiftIdea` has numeric `id`, `name`, `price`, and nullable `description`.
- The use case owns access checks, active catalog selection via existing repositories, inclusive budget filtering, eligible-ID checks, and enrichment from database values. Do not prefilter by interest labels.
- The AI output contains only `giftIdeaId`, `matchScore`, and `reason`; the use case obtains names and prices from the database.

## All-or-nothing AI validation

Treat the AI result as one response. Reject the whole result as a provider response error (`502`) if it is malformed JSON or contains any invalid recommendation: invalid shape, more than five items, non-positive/non-integer or unknown/ineligible/duplicate IDs, a score that is not an integer from 0 through 100, an empty reason, or a gift over budget. Do not silently filter invalid items. A valid array of zero through five recommendations is accepted. Valid recommendations are ordered by descending score; reasons are short Spanish explanations.

The adapter validates the provider payload and normalizes it to `AIRecommendation[]`; the use case validates IDs against the eligible catalog and budget. Both use `RecommendationProviderResponseError` for contract-invalid provider output. Provider timeouts use `RecommendationProviderTimeoutError` (`504`). Do not invent fallback recommendations or retry automatically.

## Work split

- **Teammate A — use case:** use the backend input, response, and service-port types; implement ownership/catalog/budget/enrichment behavior and reject the full result if any ID is ineligible.
- **Teammate B — controller and validation:** use the backend `RecommendationRequest` and `RecommendationResponse`; validate the HTTP body and ID, get authenticated `userId`, call the use case, and return the documented statuses.
- **Teammate C — React:** use the feature-local frontend request/response types; call Giftory's backend on button click and display loading, empty, result, and error states.
- **Together — provider adapter:** implement `GiftRecommendationService` and validate provider response shape, score, duplicate IDs, and timeout behavior. The use case then checks catalog membership and budget.

## Schema dependency

`RecommendationGiftIdea.description` is `string | null` as agreed. The current Prisma schema/repository may not yet supply it. The interface records the intended dependency; use-case code cannot populate that value until the schema and repository change is integrated. That schema migration is separate from these contracts.
