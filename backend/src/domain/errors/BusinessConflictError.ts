import { DomainError } from "./DomainError";

//The action conflicts with the current state of the data. Mapped to 409.

export class BusinessConflictError extends DomainError {
    readonly name = 'BusinessConflictError';

    constructor(message: string) {
        super(message);
    }
}
