import { db } from "./db.js"
import { fetchTmdbTitle, type MediaType, type TmdbTitle } from "./tmdb.js"

export async function upsertTitle(input: TmdbTitle) {
  return db.title.upsert({
    where: { tmdbId_mediaType: { tmdbId: input.tmdbId, mediaType: input.mediaType } },
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
  })
}

export async function getOrFetchTitle(tmdbId: number, mediaType: MediaType) {
  const existing = await db.title.findUnique({
    where: { tmdbId_mediaType: { tmdbId, mediaType } },
  })
  if (existing && Date.now() - existing.cachedAt.getTime() < 1000 * 60 * 60 * 24 && existing.backdropPath) {
    return existing
  }
  const fresh = await fetchTmdbTitle(tmdbId, mediaType)
  return upsertTitle(fresh)
}

export function publicTitle(t: {
  id?: string
  tmdbId: number
  mediaType: MediaType | string
  title: string
  posterPath: string | null
  backdropPath?: string | null
  imdbId?: string | null
  releaseDate: string | null
  overview: string | null
}) {
  return {
    id: t.id,
    tmdbId: t.tmdbId,
    mediaType: t.mediaType,
    title: t.title,
    posterPath: t.posterPath,
    posterUrl: t.posterPath ? `https://image.tmdb.org/t/p/w342${t.posterPath}` : null,
    backdropUrl: t.backdropPath ? `https://image.tmdb.org/t/p/w1280${t.backdropPath}` : null,
    imdbId: t.imdbId ?? null,
    imdbUrl: t.imdbId ? `https://www.imdb.com/title/${t.imdbId}/` : null,
    rtUrl: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(t.title)}`,
    releaseDate: t.releaseDate,
    overview: t.overview,
  }
}
