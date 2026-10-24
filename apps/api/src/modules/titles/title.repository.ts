import { db } from '#config/db.js';
import type { MediaType, TmdbTitle } from '#integrations/tmdb.js';

export async function findTitle(tmdbId: number, mediaType: MediaType) {
  return db.title.findUnique({
    where: { tmdbId_mediaType: { tmdbId, mediaType } },
  });
}

export async function upsertTitle(input: TmdbTitle) {
  return db.title.upsert({
    where: {
      tmdbId_mediaType: { tmdbId: input.tmdbId, mediaType: input.mediaType },
    },
    create: {
      tmdbId: input.tmdbId,
      mediaType: input.mediaType,
      title: input.title,
      posterPath: input.posterPath,
      backdropPath: input.backdropPath,
      imdbId: input.imdbId,
      releaseDate: input.releaseDate,
      overview: input.overview,
      runtime: input.runtime,
    },
    update: {
      title: input.title,
      posterPath: input.posterPath,
      backdropPath: input.backdropPath,
      imdbId: input.imdbId,
      releaseDate: input.releaseDate,
      overview: input.overview,
      runtime: input.runtime,
      cachedAt: new Date(),
    },
  });
}

export async function findReviewsForTitle(titleId: string) {
  return db.review.findMany({
    where: { titleId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function findLibraryEntry(userId: string, titleId: string) {
  return db.libraryEntry.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });
}

export async function findUserLists(userId: string) {
  return db.list.findMany({
    where: { userId },
    select: { id: true, name: true, slug: true },
  });
}

export async function findFriendIds(userId: string) {
  const friends = await db.friendship.findMany({
    where: { userId },
    select: { friendId: true },
  });

  return friends.map((f) => f.friendId);
}

export async function findFriendLibrary(titleId: string, friendIds: string[]) {
  if (!friendIds.length) {
    return [];
  }

  return db.libraryEntry.findMany({
    where: { titleId, userId: { in: friendIds } },
    include: { user: true },
  });
}
