import { RequestHandler } from 'express';
import { SecurityService } from '../../../domain/services/SecurityService';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

export const createAuthenticationMiddleware = (
  securityService: SecurityService,
): RequestHandler => {
  return (req, res, next) => {
    const authorization = req.get('Authorization');

    if (!authorization) {
      next(new UnauthorizedError('Authentication token is required.'));
      return;
    }

    const parts = authorization.split(' ');
    const hasBearerFormat =
      parts.length === 2 && parts[0].toLowerCase() === 'bearer' && parts[1].length > 0;

    if (!hasBearerFormat) {
      next(new UnauthorizedError('Invalid Authorization header.'));
      return;
    }

    try {
      const token = parts[1];
      const userId = securityService.verifyToken(token);

      res.locals.userId = userId;
    } catch (error) {
      next(error);
      return;
    }

    next();
  };
};
