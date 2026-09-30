import { DomainError } from "./DomainError";

//The user is not authenticated or the credentials are wrong. Mapped to 401
export class UnauthorizedError extends DomainError {
    readonly name = 'UnauthorizedError';

    constructor(message: string) {
        super(message);
    }
}