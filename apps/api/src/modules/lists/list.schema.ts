import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(500).optional(),
});

export const addListItemSchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(['MOVIE', 'TV']),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type AddListItemInput = z.infer<typeof addListItemSchema>;
