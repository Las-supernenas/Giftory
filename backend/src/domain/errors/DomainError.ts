// Base class for all domain errors

export abstract class DomainError extends Error {
  abstract readonly name: string;
}
