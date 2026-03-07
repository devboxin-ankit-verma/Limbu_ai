/**
 * User controller - request/response for trading users (traders).
 *
 * Uses standard response format. Returns UserResponse (no password). Admin-only routes use requireAdmin.
 */

import { Request, Response, NextFunction } from 'express';
import { getUserService } from '../dependencies/dependencies';
import { sendSuccess, sendList, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { UserNotFoundError, UserAlreadyExistsError } from '../services/userService';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * GET /users - list traders with pagination, search, filter, sort.
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    const search = (req.query.q as string) || (req.query.search as string);
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const userService = getUserService(req);
    const { data, total } = await userService.getAllUsers({
      skip,
      limit,
      search,
      isActive,
      sort,
      order
    });

    const userResponses = data.map((u) => userService.toResponse(u));
    sendList(res, userResponses, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /users/:userId - get one trader by id.
 */
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      sendError(res, 'Invalid user id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const userService = getUserService(req);
    const user = await userService.getUserById(userId);
    sendSuccess(res, userService.toResponse(user));
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
};

/**
 * POST /users - create trader (admin). Body: email, username, password, optional role, isActive.
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userService = getUserService(req);
    const user = await userService.createUser(req.body);
    sendSuccess(res, userService.toResponse(user), StatusCodes.CREATED);
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      sendError(res, err.message, StatusCodes.CONFLICT, err.code);
      return;
    }
    next(err);
  }
};

/**
 * PUT /users/:userId - update trader (admin).
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      sendError(res, 'Invalid user id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const userService = getUserService(req);
    const body = { ...req.body };
    if (body.password) {
      const bcrypt = await import('bcrypt');
      body.passwordHash = await bcrypt.hash(body.password, 10);
      delete body.password;
    }
    const user = await userService.updateUser(userId, body);
    sendSuccess(res, userService.toResponse(user));
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    if (err instanceof UserAlreadyExistsError) {
      sendError(res, err.message, StatusCodes.CONFLICT, err.code);
      return;
    }
    next(err);
  }
};

/**
 * DELETE /users/:userId - delete trader (admin).
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      sendError(res, 'Invalid user id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const userService = getUserService(req);
    await userService.deleteUser(userId);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
};
