/**
 * User type definitions.
 * 
 * TypeScript type definitions for User entity.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  isActive?: boolean;
}
