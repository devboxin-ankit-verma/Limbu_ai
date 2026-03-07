/**
 * Central dependency wiring.
 *
 * Controllers get services from here instead of constructing
 * Repository/Service themselves. Single place to build the object graph.
 */

import { Request } from "express";
import { UserService } from "../services/userService";

/**
 * Provide a UserService instance for the current request.
 * Uses the userRepository attached to the app at startup.
 */
export function getUserService(req: Request): UserService {
  const userRepository = req.app.get("userRepository");
  return new UserService(userRepository);
}
