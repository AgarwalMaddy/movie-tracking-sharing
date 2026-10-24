import { AppError, ValidationError } from '#errors/app-error.js';
import {
  browseTmdb,
  catalogTmdb,
  fetchTmdbCredits,
  fetchTmdbTitle,
  LANGUAGES,
  searchPeople,
  searchTmdb,
  tmdbGenres,
  toClientCast,
  toClientTitle,
  watchProviders,
  type MediaType,
} from '#integrations/tmdb.js';
import { toPublicUser } from '#utils/to-public-user.js';

import {
  FALLBACK_CAST,
  fallbackFeatured,
  fallbackRail,
  fallbackRails,
} from './catalog.fallback.js';
import * as catalogRepository from './catalog.repository.js';
import { DISCOVER_RAILS, TITLE_CACHE_MS } from './title.constants.js';
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
    Date.now() - existing.cachedAt.getTime() < TITLE_CACHE_MS &&
    existing.backdropPath
  ) {
    return existing;
  }

  try {
    const fresh = await fetchTmdbTitle(tmdbId, mediaType);

    return await titleRepository.upsertTitle(fresh);
  } catch (error) {
    if (existing) {
      return existing;
    }

    throw error;
  }
}

export { upsertTitle } from './title.repository.js';

function storedToClient(t: {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  imdbId?: string | null;
  releaseDate: string | null;
  overview: string | null;
}) {
  return toClientTitle({
    tmdbId: t.tmdbId,
    mediaType: t.mediaType === 'TV' ? 'TV' : 'MOVIE',
    title: t.title,
    posterPath: t.posterPath,
    backdropPath: t.backdropPath ?? null,
    imdbId: t.imdbId ?? null,
    releaseDate: t.releaseDate,
    overview: t.overview,
    runtime: null,
  });
}

export async function searchTitles(query: string) {
  if (query.length < 2) {
    return [];
  }

  try {
    const results = await searchTmdb(query);

    return results.map(toClientTitle);
  } catch {
    const cached = await catalogRepository.searchCachedTitles(query);

    if (cached.length) {
      return cached.map(storedToClient);
    }

    const q = query.toLowerCase();
    const seen = new Set<number>();

    return fallbackRails()
      .flatMap((rail) => rail.titles)
      .filter((t) => {
        if (!t.title.toLowerCase().includes(q) || seen.has(t.tmdbId)) {
          return false;
        }

        seen.add(t.tmdbId);

        return true;
      })
      .map(storedToClient);
  }
}

async function loadRail(def: (typeof DISCOVER_RAILS)[number]): Promise<{
  id: string;
  label: string;
  kind: string;
  titles: ReturnType<typeof toClientTitle>[];
  stale: boolean;
}> {
  try {
    const titles = await catalogTmdb(def.path, def.mediaType);

    if (titles.length) {
      await catalogRepository.saveRail(def, titles);
    }

    return {
      id: def.id,
      label: def.label,
      kind: def.kind,
      titles: titles.map(toClientTitle),
      stale: false,
    };
  } catch {
    const snap = await catalogRepository.readRail(def.id);

    if (snap?.titles.length) {
      return {
        id: def.id,
        label: def.label,
        kind: def.kind,
        titles: snap.titles.map(storedToClient),
        stale: true,
      };
    }

    const bundled = fallbackRail(def);

    await catalogRepository.saveRail(def, bundled).catch(() => undefined);

    return {
      id: def.id,
      label: def.label,
      kind: def.kind,
      titles: bundled.map(storedToClient),
      stale: true,
    };
  }
}

export async function discoverRails() {
  const rails = await Promise.all(DISCOVER_RAILS.map(loadRail));
  const hasTitles = rails.some((r) => r.titles.length);
  const stale = rails.some((r) => r.stale);

  if (!hasTitles) {
    const packed = fallbackRails();

    await Promise.all(
      DISCOVER_RAILS.map((def, i) =>
        catalogRepository
          .saveRail(def, packed[i]?.titles ?? [])
          .catch(() => undefined),
      ),
    );

    const headTitle = packed[0]?.titles[0] ?? fallbackFeatured();

    return {
      stale: true,
      featured: {
        title: storedToClient(headTitle),
        cast: FALLBACK_CAST.map(toClientCast),
      },
      rails: packed.map((rail) => ({
        id: rail.id,
        label: rail.label,
        kind: rail.kind,
        titles: rail.titles.map(storedToClient),
      })),
    };
  }

  const head =
    rails
      .find((r) => r.titles.some((t) => t.backdropUrl))
      ?.titles.find((t) => t.backdropUrl) ??
    rails.find((r) => r.titles.length)?.titles[0];
  let featured: {
    title: (typeof rails)[number]['titles'][number];
    cast: ReturnType<typeof toClientCast>[];
  } | null = null;

  if (head) {
    const mediaType = head.mediaType === 'TV' ? 'TV' : 'MOVIE';
    const liveCast = await fetchTmdbCredits(head.tmdbId, mediaType).catch(
      () => [],
    );
    let cast = liveCast;

    if (!cast.length && head.tmdbId === 155) {
      cast = FALLBACK_CAST;
    }

    featured = { title: head, cast: cast.map(toClientCast) };
  }

  return {
    stale,
    featured,
    rails: rails.map(({ stale: _stale, ...rail }) => rail),
  };
}

export async function discoverMeta() {
  try {
    const genres = await tmdbGenres();

    return { genres, languages: LANGUAGES };
  } catch {
    return { genres: [], languages: LANGUAGES };
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
  } catch {
    return [];
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

  const [title, providers, cast] = await Promise.all([
    getOrFetchTitle(tmdbId, mediaType),
    watchProviders(tmdbId, mediaType).catch(() => []),
    fetchTmdbCredits(tmdbId, mediaType).catch(() => []),
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
    cast: cast.map(toClientCast),
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
