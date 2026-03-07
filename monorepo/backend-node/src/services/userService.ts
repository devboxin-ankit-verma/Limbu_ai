/**
 * User service - business logic only.
 *
 * NO database queries (use Repository), NO HTTP handling (use Controllers).
 */

import bcrypt from 'bcrypt';
import { User, CreateUserData, UpdateUserData, UserResponse } from '../models/User';
import { UserRepository, ListUsersOptions } from '../repositories/userRepository';
import { NotFoundError, ConflictError } from '../utils/errors';
import { ErrorMessages } from '../constants/errors';

export class UserNotFoundError extends NotFoundError {
  constructor(message: string = ErrorMessages.USER_NOT_FOUND) {
    super(message);
  }
}

export class UserAlreadyExistsError extends ConflictError {
  constructor(message: string = ErrorMessages.USER_ALREADY_EXISTS) {
    super(message);
  }
}

/** Input for creating a user (API sends password; service hashes it). */
export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  role?: string;
  isActive?: boolean;
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
   * Get all users with pagination, search, filter, sort.
   *
   * @param options - skip, limit, search, isActive, sort, order
   * @returns List of users and total count
   */
  async getAllUsers(options: ListUsersOptions): Promise<{ data: User[]; total: number }> {
    return await this.userRepository.findAll(options);
  }

  /**
   * Create a new user. Hashes password in service.
   *
   * @param input - email, username, password (plain), optional role, isActive
   * @returns Created user (internal; controller should return UserResponse)
   * @throws UserAlreadyExistsError if user with email or username already exists
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const existingByEmail = await this.userRepository.findByEmail(input.email);
    if (existingByEmail) throw new UserAlreadyExistsError();

    const existingByUsername = await this.userRepository.findByUsername(input.username);
    if (existingByUsername) throw new UserAlreadyExistsError();

    const passwordHash = await bcrypt.hash(input.password, 10);
    const userData: CreateUserData = {
      email: input.email,
      username: input.username,
      passwordHash,
      role: input.role ?? 'trader',
      isActive: input.isActive ?? true
    };
    return await this.userRepository.create(userData);
  }
  
  /**
   * Update user. If password provided in userData, it must be already hashed (or add a separate method for plain password).
   */
  async updateUser(userId: number, userData: UpdateUserData): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError();

    if (userData.email) {
      const existing = await this.userRepository.findByEmail(userData.email);
      if (existing && existing.id !== userId) throw new UserAlreadyExistsError();
    }
    if (userData.username) {
      const existing = await this.userRepository.findByUsername(userData.username);
      if (existing && existing.id !== userId) throw new UserAlreadyExistsError();
    }

    const updated = await this.userRepository.update(userId, userData);
    if (!updated) throw new UserNotFoundError();
    return updated;
  }

  /** Map User to API response (no password). */
  toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
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
