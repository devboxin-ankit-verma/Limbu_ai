/**
 * Augments Express Request with authenticated user payload.
 */

export interface AuthPayload {
  userId: number;
  role: 'provider' | 'customer' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
