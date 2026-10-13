import { RequestHandler, Router } from 'express';
import { CreateEventUseCase } from '../../domain/event/use-cases/CreateEventUseCase';
import { DeleteEventUseCase } from '../../domain/event/use-cases/DeleteEventUseCase';
import { ListEventsUseCase } from '../../domain/event/use-cases/ListEventsUseCase';
import { UpdateEventUseCase } from '../../domain/event/use-cases/UpdateEventUseCase';
import { createCreateEventController } from './controllers/create-event-controller';
import { createDeleteEventController } from './controllers/delete-event-controller';
import { createListEventsController } from './controllers/list-events-controller';
import { createUpdateEventController } from './controllers/update-event-controller';

// everything the Event router needs. All of it is created once in index.ts
export interface EventRouterDependencies {
    authenticationMiddleware: RequestHandler;
    listEventsUseCase: ListEventsUseCase;
    createEventUseCase: CreateEventUseCase;
    updateEventUseCase: UpdateEventUseCase;
    deleteEventUseCase: DeleteEventUseCase;
}

export const createEventRouter = ({
    authenticationMiddleware,
    listEventsUseCase,
    createEventUseCase,
    updateEventUseCase,
    deleteEventUseCase,
}: EventRouterDependencies) => {
    const eventRouter = Router();

    // This router is mounted on /api because its routes start with /people and /events.
    // Authentication is added to each route (not with eventRouter.use) so that other /api
    // requests passing through this router are not affected (unknown routes still return 404).
    eventRouter.get(
        '/people/:personId/events',
        authenticationMiddleware,
        createListEventsController(listEventsUseCase),
    ); // GET    /api/people/:personId/events
    eventRouter.post(
        '/people/:personId/events',
        authenticationMiddleware,
        createCreateEventController(createEventUseCase),
    ); // POST   /api/people/:personId/events
    eventRouter.patch(
        '/events/:id',
        authenticationMiddleware,
        createUpdateEventController(updateEventUseCase),
    ); // PATCH  /api/events/:id
    eventRouter.delete(
        '/events/:id',
        authenticationMiddleware,
        createDeleteEventController(deleteEventUseCase),
    ); // DELETE /api/events/:id

    return eventRouter;
};
