import { AppError, ValidationError } from '#errors/app-error.js';
import {
  browseTmdb,
  catalogTmdb,
  fetchTmdbTitle,
  LANGUAGES,
  searchPeople,
  searchTmdb,
  tmdbGenres,
  toClientTitle,
  watchProviders,
  type MediaType,
} from '#integrations/tmdb.js';
import { memo } from '#utils/cache.js';
import { toPublicUser } from '#utils/to-public-user.js';

import * as titleRepository from './title.repository.js';

export function publicTitle(t: {
  id?: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  imdbId?: string | null;
  releaseDate: string | null;
  overview: string | null;
}) {
  return {
    id: t.id,
    tmdbId: t.tmdbId,
    mediaType: t.mediaType,
    title: t.title,
    posterPath: t.posterPath,
    posterUrl: t.posterPath
      ? `https://image.tmdb.org/t/p/w342${t.posterPath}`
      : null,
    backdropUrl: t.backdropPath
      ? `https://image.tmdb.org/t/p/w1280${t.backdropPath}`
      : null,
    imdbId: t.imdbId ?? null,
    imdbUrl: t.imdbId ? `https://www.imdb.com/title/${t.imdbId}/` : null,
    rtUrl: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(t.title)}`,
    releaseDate: t.releaseDate,
    overview: t.overview,
  };
}

export async function getOrFetchTitle(tmdbId: number, mediaType: MediaType) {
  const existing = await titleRepository.findTitle(tmdbId, mediaType);

  if (
    existing &&
    Date.now() - existing.cachedAt.getTime() < 1000 * 60 * 60 * 24 &&
    existing.backdropPath
  ) {
    return existing;
  }

  const fresh = await fetchTmdbTitle(tmdbId, mediaType);

  return titleRepository.upsertTitle(fresh);
}

export { upsertTitle } from './title.repository.js';

export async function searchTitles(query: string) {
  if (query.length < 2) {
    return [];
  }

  try {
    const results = await searchTmdb(query);

    return results.map(toClientTitle);
  } catch (error) {
    throw new AppError({
      code: 'TMDB',
      message: error instanceof Error ? error.message : 'TMDB error',
    });
  }
}

export async function discoverRails() {
  try {
    return await memo('discover:rails', 1000 * 60 * 10, async () => {
      const [
        trending,
        popularMovies,
        topRated,
        nowPlaying,
        upcoming,
        popularTv,
      ] = await Promise.all([
        catalogTmdb('/trending/all/week', 'MOVIE'),
        catalogTmdb('/movie/popular', 'MOVIE'),
        catalogTmdb('/movie/top_rated', 'MOVIE'),
        catalogTmdb('/movie/now_playing', 'MOVIE'),
        catalogTmdb('/movie/upcoming', 'MOVIE'),
        catalogTmdb('/tv/popular', 'TV'),
      ]);

      return {
        rails: [
          {
            id: 'trending',
            label: 'This week',
            kind: 'all',
            titles: trending.map(toClientTitle),
          },
          {
            id: 'now',
            label: 'In theatres',
            kind: 'movie',
            titles: nowPlaying.map(toClientTitle),
          },
          {
            id: 'upcoming',
            label: 'Coming soon',
            kind: 'movie',
            titles: upcoming.map(toClientTitle),
          },
          {
            id: 'popular-movies',
            label: 'Popular movies',
            kind: 'movie',
            titles: popularMovies.map(toClientTitle),
          },
          {
            id: 'top',
            label: 'Top rated',
            kind: 'movie',
            titles: topRated.map(toClientTitle),
          },
          {
            id: 'popular-tv',
            label: 'Popular series',
            kind: 'tv',
            titles: popularTv.map(toClientTitle),
          },
        ],
      };
    });
  } catch (error) {
    throw new AppError({
      code: 'TMDB',
      message: error instanceof Error ? error.message : 'TMDB error',
    });
  }
}

export async function discoverMeta() {
  try {
    const genres = await tmdbGenres();

    return { genres, languages: LANGUAGES };
  } catch (error) {
    throw new AppError({
      code: 'TMDB',
      message: error instanceof Error ? error.message : 'TMDB error',
    });
  }
}

export async function discoverPeople(
  query: string,
  role: 'actor' | 'actress' | 'director',
) {
  if (query.length < 2) {
    return [];
  }

  try {
    return await searchPeople(query, role);
  } catch (error) {
    throw new AppError({
      code: 'TMDB',
      message: error instanceof Error ? error.message : 'TMDB error',
    });
  }
}

export async function browseTitles(opts: {
  kind: 'movie' | 'tv';
  year?: string;
  genre?: string;
  language?: string;
  person?: string;
  credit: 'cast' | 'crew';
}) {
  try {
    const titles = await browseTmdb(opts);

    return titles.map(toClientTitle);
  } catch (error) {
    throw new AppError({
      code: 'TMDB',
      message: error instanceof Error ? error.message : 'TMDB error',
    });
  }
}

export async function getTitlePage(
  tmdbId: number,
  mediaType: MediaType,
  userId: string | undefined,
) {
  if (!Number.isFinite(tmdbId)) {
    throw new ValidationError('Bad id');
  }

  const [title, providers] = await Promise.all([
    getOrFetchTitle(tmdbId, mediaType),
    watchProviders(tmdbId, mediaType).catch(() => []),
  ]);
  const [reviews, library, lists] = await Promise.all([
    titleRepository.findReviewsForTitle(title.id),
    userId ? titleRepository.findLibraryEntry(userId, title.id) : null,
    userId ? titleRepository.findUserLists(userId) : [],
  ]);
  const friendIds = userId ? await titleRepository.findFriendIds(userId) : [];
  const friendLib = await titleRepository.findFriendLibrary(
    title.id,
    friendIds,
  );

  return {
    title: publicTitle(title),
    providers,
    mine: library,
    myLists: lists,
    reviews: reviews.map((r) => ({
      id: r.id,
      body: r.body,
      rating: r.rating,
      createdAt: r.createdAt,
      user: toPublicUser(r.user),
    })),
    friendStatuses: friendLib.map((e) => ({
      user: toPublicUser(e.user),
      status: e.status,
      rating: e.rating,
    })),
  };
}
