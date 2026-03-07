/**
 * User service - business logic only.
 * 
 * This module contains ONLY business logic.
 * NO database queries (use Repository), NO HTTP handling (use Controllers).
 */

import { User, CreateUserData, UpdateUserData } from '../models/User';
import { UserRepository } from '../repositories/userRepository';
import { ErrorMessages, ErrorCodes } from '../constants/errors';

export class UserNotFoundError extends Error {
  code: string;
  
  constructor(message: string = ErrorMessages.USER_NOT_FOUND) {
    super(message);
    this.name = 'UserNotFoundError';
    this.code = ErrorCodes.USER_NOT_FOUND;
  }
}

export class UserAlreadyExistsError extends Error {
  code: string;
  
  constructor(message: string = ErrorMessages.USER_ALREADY_EXISTS) {
    super(message);
    this.name = 'UserAlreadyExistsError';
    this.code = ErrorCodes.USER_ALREADY_EXISTS;
  }
}

/**
 * User service - handles all business logic for users.
 * 
 * This class contains ONLY business logic.
 * Database access is delegated to Repository.
 * HTTP handling is delegated to Controllers.
 */
export class UserService {
  private userRepository: UserRepository;
  
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  
  /**
   * Get user by ID with business logic.
   * 
   * @param userId - User ID to retrieve
   * @returns User instance
   * @throws UserNotFoundError if user does not exist
   */
  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }
  
  /**
   * Get user by email.
   * 
   * @param email - Email to search for
   * @returns User if found, null otherwise
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }
  
  /**
   * Get all users with pagination.
   * 
   * @param skip - Number of records to skip
   * @param limit - Maximum number of records to return
   * @returns List of users
   */
  async getAllUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    return await this.userRepository.findAll(skip, limit);
  }
  
  /**
   * Create a new user with business logic validation.
   * 
   * @param userData - User data to create
   * @returns Created user
   * @throws UserAlreadyExistsError if user with email or username already exists
   */
  async createUser(userData: CreateUserData): Promise<User> {
    // Business logic: Check if user already exists
    const existingByEmail = await this.userRepository.findByEmail(userData.email);
    if (existingByEmail) {
      throw new UserAlreadyExistsError();
    }
    
    const existingByUsername = await this.userRepository.findByUsername(userData.username);
    if (existingByUsername) {
      throw new UserAlreadyExistsError();
    }
    
    // Business logic: Set defaults
    const userDataWithDefaults: CreateUserData = {
      ...userData,
      isActive: userData.isActive ?? true,
      isAdmin: userData.isAdmin ?? false
    };
    
    return await this.userRepository.create(userDataWithDefaults);
  }
  
  /**
   * Update user with business logic validation.
   * 
   * @param userId - ID of user to update
   * @param userData - Updated user data
   * @returns Updated user
   * @throws UserNotFoundError if user does not exist
   * @throws UserAlreadyExistsError if email/username conflict
   */
  async updateUser(userId: number, userData: UpdateUserData): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    
    // Business logic: Prevent email/username conflicts
    if (userData.email) {
      const existing = await this.userRepository.findByEmail(userData.email);
      if (existing && existing.id !== userId) {
        throw new UserAlreadyExistsError();
      }
    }
    
    if (userData.username) {
      const existing = await this.userRepository.findByUsername(userData.username);
      if (existing && existing.id !== userId) {
        throw new UserAlreadyExistsError();
      }
    }
    
    const updated = await this.userRepository.update(userId, userData);
    if (!updated) {
      throw new UserNotFoundError();
    }
    
    return updated;
  }
  
  /**
   * Delete user with business logic.
   * 
   * @param userId - ID of user to delete
   * @throws UserNotFoundError if user does not exist
   */
  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    
    await this.userRepository.delete(userId);
  }
}
