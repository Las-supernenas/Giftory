import { RequestHandler } from 'express';
import { SecurityService } from '../../../domain/services/SecurityService';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';
import { AUTH_COOKIE_NAME } from '../../user/auth-cookie';

export const createAuthenticationMiddleware = (
  securityService: SecurityService,
): RequestHandler => {
  return (req, res, next) => {
    const token = req.cookies[AUTH_COOKIE_NAME];

    if (typeof token !== 'string' || token.length === 0) {
      next(new UnauthorizedError('Authentication token is required.'));
      return;
    }
    try {
      const userId = securityService.verifyToken(token);
      res.locals.userId = userId;
    } catch (error) {
      next(error);
      return;
    }
    next();
  };
};
