import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ListEventsUseCase } from '../../../domain/event/use-cases/ListEventsUseCase';
import { getAuthenticatedUserId } from '../../shared/utils/get-authenticated-user-id';
import { personIdSchema } from '../../person/person-schemas';
import { toEventResponse } from '../event-schemas';

// GET /api/people/:personId/events builds the controller that lists the events of a person
export const createListEventsController =
  (listEventsUseCase: ListEventsUseCase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // user who makes the request (set by the authentication middleware)
      const userId = getAuthenticatedUserId(res);

      // validate the :personId from the URL and convert it to a number (400 if invalid)
      const personIdResult = personIdSchema.safeParse(req.params.personId);
      if (!personIdResult.success) {
        throw new ValidationError(personIdResult.error.issues[0].message);
      }

      // the use case checks that the person belongs to the user (404 if not)
      const events = await listEventsUseCase.execute({ userId, personId: personIdResult.data });

      res.status(200).json(events.map(toEventResponse));
    } catch (error) {
      next(error);
    }
  };
