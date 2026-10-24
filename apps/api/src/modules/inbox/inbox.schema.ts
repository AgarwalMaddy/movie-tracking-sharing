import { z } from 'zod';

export const recommendSchema = z.object({
  username: z.string(),
  tmdbId: z.number(),
  mediaType: z.enum(['MOVIE', 'TV']),
  message: z.string().trim().min(1).max(1000),
});

export type RecommendInput = z.infer<typeof recommendSchema>;
