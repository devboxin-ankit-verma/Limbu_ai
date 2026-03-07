/**
 * Request validators for auth routes (Zod).
 */

import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
});

export type AdminLoginBody = z.infer<typeof adminLoginSchema>;
