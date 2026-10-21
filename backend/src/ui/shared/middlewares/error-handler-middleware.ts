import { NextFunction, Request, Response } from 'express';
import { BusinessConflictError } from '../../../domain/errors/BusinessConflictError';
import { EntityNotFoundError } from '../../../domain/errors/EntityNotFoundError';
import { ForbiddenOperationError } from '../../../domain/errors/ForbiddenOperationError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { RecommendationProviderResponseError } from '../../../domain/errors/RecommendationProviderResponseError';
import { RecommendationProviderTimeoutError } from '../../../domain/errors/RecommendationProviderTimeoutError';
import { RecommendationProviderUnavailableError } from '../../../domain/errors/RecommendationProviderUnavailableError';
import multer from 'multer';

//Translates domain errors into HTTP responses

export const errorHandlerMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  // Express needs the 4 parameters to recognise this as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (error instanceof multer.MulterError) {
    res.status(400).json({
      error:
        error.code === 'LIMIT_FILE_SIZE'
          ? 'La imagen no puede superar 5 MB.'
          : 'No se pudo subir la imagen.',
    });
  } else if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
  } else if (error instanceof UnauthorizedError) {
    res.status(401).json({ error: error.message });
  } else if (error instanceof ForbiddenOperationError) {
    res.status(403).json({ error: error.message });
  } else if (error instanceof EntityNotFoundError) {
    res.status(404).json({ error: error.message });
  } else if (error instanceof BusinessConflictError) {
    res.status(409).json({ error: error.message });
  } else if (error instanceof RecommendationProviderResponseError) {
    res.status(502).json({ error: error.message });
  } else if (error instanceof RecommendationProviderUnavailableError) {
    res.status(502).json({ error: error.message });
  } else if (error instanceof RecommendationProviderTimeoutError) {
    res.status(504).json({ error: error.message });
  } else if (error instanceof SyntaxError && 'body' in error) {
    // Malformed JSON in the request body
    res.status(400).json({ error: 'Invalid JSON body' });
  } else {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
