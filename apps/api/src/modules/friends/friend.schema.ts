import { z } from 'zod';

export const friendRequestSchema = z.object({
  username: z.string(),
});

export const friendRespondSchema = z.object({
  requestId: z.string(),
  accept: z.boolean(),
});

export type FriendRequestInput = z.infer<typeof friendRequestSchema>;
export type FriendRespondInput = z.infer<typeof friendRespondSchema>;
