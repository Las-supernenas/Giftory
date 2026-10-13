import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { DeleteEventUseCase } from '../../../domain/event/use-cases/DeleteEventUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { eventIdSchema } from '../event-schemas';

// DELETE /api/events/:id builds the controller that deletes an event
export const createDeleteEventController =
    (deleteEventUseCase: DeleteEventUseCase) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userId = getAuthenticatedUserId(res);

                const idResult = eventIdSchema.safeParse(req.params.id);
                if (!idResult.success) {
                    throw new ValidationError(idResult.error.issues[0].message);
                }

                await deleteEventUseCase.execute({ userId, eventId: idResult.data });

                // 204 No Content: deleted, nothing to return
                res.status(204).send();
            } catch (error) {
                next(error);
            }
        };
