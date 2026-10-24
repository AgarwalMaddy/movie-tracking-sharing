import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
  password: z.string().min(8).max(72),
  username: z.string().trim().toLowerCase(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
