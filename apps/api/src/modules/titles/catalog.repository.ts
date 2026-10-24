import { db } from '#config/db.js';
import type { TmdbTitle } from '#integrations/tmdb.js';

import type { RailDef } from './title.constants.js';

export type StoredRail = {
  id: string;
  label: string;
  kind: string;
  titles: ReturnType<typeof toStoredTitle>[];
};

function toStoredTitle(t: TmdbTitle) {
  return {
    tmdbId: t.tmdbId,
    mediaType: t.mediaType,
    title: t.title,
    posterPath: t.posterPath,
    backdropPath: t.backdropPath,
    imdbId: t.imdbId,
    releaseDate: t.releaseDate,
    overview: t.overview,
  };
}

export async function saveRail(def: RailDef, titles: TmdbTitle[]) {
  const payload: StoredRail = {
    id: def.id,
    label: def.label,
    kind: def.kind,
    titles: titles.map(toStoredTitle),
  };

  await db.catalogSnapshot.upsert({
    where: { id: def.id },
    create: { id: def.id, payload },
    update: { payload },
  });

  await Promise.all(
    titles.map((t) =>
      db.title.upsert({
        where: {
          tmdbId_mediaType: { tmdbId: t.tmdbId, mediaType: t.mediaType },
        },
        create: {
          tmdbId: t.tmdbId,
          mediaType: t.mediaType,
          title: t.title,
          posterPath: t.posterPath,
          backdropPath: t.backdropPath,
          imdbId: t.imdbId,
          releaseDate: t.releaseDate,
          overview: t.overview,
          runtime: t.runtime,
        },
        update: {
          title: t.title,
          posterPath: t.posterPath,
          backdropPath: t.backdropPath,
          imdbId: t.imdbId,
          releaseDate: t.releaseDate,
          overview: t.overview,
          runtime: t.runtime,
          cachedAt: new Date(),
        },
      }),
    ),
  );
}

export async function readRail(id: string): Promise<StoredRail | null> {
  const row = await db.catalogSnapshot.findUnique({ where: { id } });

  if (!row) {
    return null;
  }

  return row.payload as StoredRail;
}

export async function searchCachedTitles(query: string) {
  return db.title.findMany({
    where: { title: { contains: query, mode: 'insensitive' } },
    orderBy: { cachedAt: 'desc' },
    take: 20,
  });
}
