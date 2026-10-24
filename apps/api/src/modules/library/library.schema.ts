import { z } from 'zod';

export const upsertLibrarySchema = z.object({
  status: z.enum(['WANT', 'WATCHING', 'WATCHED']),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export type UpsertLibraryInput = z.infer<typeof upsertLibrarySchema>;
