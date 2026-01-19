/**
 * User controller - request/response handling only.
 * 
 * This module contains ONLY HTTP request/response handling.
 * NO business logic (use Service), NO database queries (use Repository).
 */

import { Request, Response } from 'express';
import { UserService, UserNotFoundError, UserAlreadyExistsError } from '../services/userService';
import { StatusCodes } from '../constants/api';
import { ErrorMessages } from '../constants/errors';

/**
 * Get all users.
 * 
 * This controller delegates ALL business logic to the service.
 * It only handles HTTP request/response.
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const userService = new UserService(req.app.get('userRepository'));
    const users = await userService.getAllUsers(skip, limit);
    
    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: ErrorMessages.INTERNAL_ERROR
    });
  }
};

/**
 * Get user by ID.
 * 
 * This controller delegates ALL business logic to the service.
 * It only handles HTTP request/response and error translation.
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    const userService = new UserService(req.app.get('userRepository'));
    const user = await userService.getUserById(userId);
    
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: ErrorMessages.USER_NOT_FOUND
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR
      });
    }
  }
};

/**
 * Create a new user.
 * 
 * This controller delegates ALL business logic to the service.
 * It only handles HTTP request/response and error translation.
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userService = new UserService(req.app.get('userRepository'));
    const user = await userService.createUser(req.body);
    
    res.status(StatusCodes.CREATED).json(user);
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      res.status(StatusCodes.CONFLICT).json({
        error: ErrorMessages.USER_ALREADY_EXISTS
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR
      });
    }
  }
};

/**
 * Update user.
 * 
 * This controller delegates ALL business logic to the service.
 * It only handles HTTP request/response and error translation.
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    const userService = new UserService(req.app.get('userRepository'));
    const user = await userService.updateUser(userId, req.body);
    
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: ErrorMessages.USER_NOT_FOUND
      });
    } else if (error instanceof UserAlreadyExistsError) {
      res.status(StatusCodes.CONFLICT).json({
        error: ErrorMessages.USER_ALREADY_EXISTS
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR
      });
    }
  }
};

/**
 * Delete user.
 * 
 * This controller delegates ALL business logic to the service.
 * It only handles HTTP request/response and error translation.
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    const userService = new UserService(req.app.get('userRepository'));
    await userService.deleteUser(userId);
    
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: ErrorMessages.USER_NOT_FOUND
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR
      });
    }
  }
};
