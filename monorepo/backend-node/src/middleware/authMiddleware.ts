/**
 * Authentication middleware - JWT verification and role checks.
 *
 * Attaches req.user (id, role, type) for downstream use. Platform-independent.
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';

export interface AuthUser {
  id: number;
  role: string;
  type: 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Extract Bearer token from Authorization header or from body/query (for Socket handshake).
 */
function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

/**
 * Middleware: verify JWT and attach req.user.
 * Does not require admin; use requireAdmin for admin-only routes.
 */
export function authMiddleware(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = getTokenFromRequest(req);
    if (!token) {
      sendError(res, 'Authorization token required', StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED');
      return;
    }

    const payload = authService.verifyToken(token);
    if (!payload) {
      sendError(res, 'Invalid or expired token', StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED');
      return;
    }

    req.user = {
      id: parseInt(payload.sub, 10),
      role: payload.role,
      type: payload.type
    };
    next();
  };
}

/**
 * Middleware: require admin. Must be used after authMiddleware.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }
  if (req.user.type !== 'admin') {
    next(new ForbiddenError('Admin access required'));
    return;
  }
  next();
}
