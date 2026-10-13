import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { UpdateEventUseCase } from '../../../domain/event/use-cases/UpdateEventUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { eventIdSchema, toEventResponse, updateEventSchema } from '../event-schemas';

// PATCH /api/events/:id builds the controller that updates an event
export const createUpdateEventController =
    (updateEventUseCase: UpdateEventUseCase) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userId = getAuthenticatedUserId(res);

                const idResult = eventIdSchema.safeParse(req.params.id);
                if (!idResult.success) {
                    throw new ValidationError(idResult.error.issues[0].message);
                }

                // validate the body: name and/or date (400 if invalid or empty)
                const bodyResult = updateEventSchema.safeParse(req.body);
                if (!bodyResult.success) {
                    throw new ValidationError(bodyResult.error.issues[0].message);
                }

                const { name, date } = bodyResult.data;

                // the use case checks ownership through the person: another user's event returns 404
                const event = await updateEventUseCase.execute({
                    userId,
                    eventId: idResult.data,
                    name,
                    date,
                });

                // 200 with the updated event
                res.status(200).json(toEventResponse(event));
            } catch (error) {
                next(error);
            }
        };
