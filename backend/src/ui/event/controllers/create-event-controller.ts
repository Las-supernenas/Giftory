import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { CreateEventUseCase } from '../../../domain/event/use-cases/CreateEventUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { personIdSchema } from '../../person/person-schemas';
import { createEventSchema, toEventResponse } from '../event-schemas';

// POST /api/people/:personId/events builds the controller that creates an event for a person
export const createCreateEventController =
    (createEventUseCase: CreateEventUseCase) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userId = getAuthenticatedUserId(res);

                const personIdResult = personIdSchema.safeParse(req.params.personId);
                if (!personIdResult.success) {
                    throw new ValidationError(personIdResult.error.issues[0].message);
                }

                // validate the body: name and date are required (400 if invalid)
                const bodyResult = createEventSchema.safeParse(req.body);
                if (!bodyResult.success) {
                    throw new ValidationError(bodyResult.error.issues[0].message);
                }

                const { name, date } = bodyResult.data;

                const event = await createEventUseCase.execute({
                    userId,
                    personId: personIdResult.data,
                    name,
                    date,
                });

                // 201 created with the new event
                res.status(201).json(toEventResponse(event));
            } catch (error) {
                next(error);
            }
        };
