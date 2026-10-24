import type { MediaType } from '#integrations/tmdb.js';

import { logActivity } from '../activity/activity.repository.js';
import { getOrFetchTitle, publicTitle } from '../titles/title.service.js';

import * as libraryRepository from './library.repository.js';
import type { UpsertLibraryInput } from './library.schema.js';

export async function upsertLibrary(
  userId: string,
  tmdbId: number,
  mediaType: MediaType,
  input: UpsertLibraryInput,
) {
  const title = await getOrFetchTitle(tmdbId, mediaType);
  const entry = await libraryRepository.upsertEntry({
    userId,
    titleId: title.id,
    status: input.status,
    rating: input.rating,
    note: input.note,
  });

  if (input.status === 'WATCHED') {
    await libraryRepository.createWatchLog(userId, title.id);
    await logActivity(userId, 'WATCHED', {
      titleId: title.id,
      title: title.title,
    });
  }

  return entry;
}

export async function listLibrary(userId: string, status?: string) {
  const entries = await libraryRepository.listEntries(userId, status);

  return entries.map((e) => ({ ...e, title: publicTitle(e.title) }));
}

export async function listHistory(userId: string) {
  const logs = await libraryRepository.listHistory(userId);

  return logs.map((l) => ({ ...l, title: publicTitle(l.title) }));
}
