/**
 * Auth controller - request/response for authentication.
 *
 * Uses standard response format. No UI-specific logic.
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { UnauthorizedError } from '../utils/errors';
import { adminLoginSchema } from '../validators/authValidators';
export function getAuthService(req: Request): AuthService {
  return req.app.get('authService');
}

/**
 * POST /auth/admin/login
 * Body: { email, password }
 * Returns: { success, data: { token, adminUser } }
 */
export async function adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = adminLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ') || 'Validation failed';
      sendError(res, msg, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const authService = getAuthService(req);
    const result = await authService.adminLogin(parsed.data);
    sendSuccess(res, result, StatusCodes.OK);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      sendError(res, err.message, StatusCodes.UNAUTHORIZED, err.code);
      return;
    }
    next(err);
  }
}
