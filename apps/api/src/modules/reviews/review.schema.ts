import { z } from 'zod';

export const upsertReviewSchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(['MOVIE', 'TV']),
  body: z.string().trim().min(10).max(4000),
  rating: z.number().int().min(1).max(10).optional(),
});

export type UpsertReviewInput = z.infer<typeof upsertReviewSchema>;
