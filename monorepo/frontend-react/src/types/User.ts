/**
 * User (trader) type - aligned with backend API response.
 */

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
