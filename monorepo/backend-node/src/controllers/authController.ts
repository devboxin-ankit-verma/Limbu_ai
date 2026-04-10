/**
 * Auth controller — request/response handling for auth endpoints.
 *
 * No business logic — delegates to AuthService.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { StatusCodes } from '../constants/api';
import { ValidationError } from '../utils/errors';

function getAuthService(req: Request): AuthService {
  return req.app.get('authService');
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }
    const result = await getAuthService(req).register(req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }
    const result = await getAuthService(req).login(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ValidationError('Refresh token is required');
    const result = getAuthService(req).refreshToken(refreshToken);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};
