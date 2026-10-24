import { z } from 'zod';

import { env } from '#config/env.js';
import { memo } from '#utils/cache.js';

const TMDB = 'https://api.themoviedb.org/3';

export type MediaType = 'MOVIE' | 'TV';

export type TmdbTitle = {
  tmdbId: number;
  title: string;
  mediaType: MediaType;
  posterPath: string | null;
  backdropPath: string | null;
  imdbId: string | null;
  releaseDate: string | null;
  overview: string | null;
  runtime: number | null;
};

export type WatchOffer = {
  name: string;
  logoUrl: string | null;
  type: 'stream' | 'rent' | 'buy';
};

const listItem = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  media_type: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  overview: z.string().optional(),
});

async function tmdb(path: string, attempt = 0): Promise<unknown> {
  if (!env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY not configured');
  }

  const join = path.includes('?') ? '&' : '?';

  try {
    const res = await fetch(
      `${TMDB}${path}${join}api_key=${env.TMDB_API_KEY}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Reelwright/0.1 (local; movie-tracking-sharing)',
        },
      },
    );

    if (!res.ok) {
      throw new Error(`TMDB ${res.status}`);
    }

    return await res.json();
  } catch (e) {
    if (attempt < 2) {
      return await tmdb(path, attempt + 1);
    }

    throw e;
  }
}

function mapRow(r: z.infer<typeof listItem>, mediaType: MediaType): TmdbTitle {
  return {
    tmdbId: r.id,
    title: r.title || r.name || 'Untitled',
    mediaType,
    posterPath: r.poster_path ?? null,
    backdropPath: r.backdrop_path ?? null,
    imdbId: null,
    releaseDate: r.release_date || r.first_air_date || null,
    overview: r.overview ?? null,
    runtime: null,
  };
}

export async function searchTmdb(query: string): Promise<TmdbTitle[]> {
  const data = (await tmdb(
    `/search/multi?query=${encodeURIComponent(query)}`,
  )) as { results?: unknown };
  const rows = z.array(listItem).parse(data.results ?? []);

  return rows
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => mapRow(r, r.media_type === 'movie' ? 'MOVIE' : 'TV'));
}

export async function fetchTmdbTitle(
  tmdbId: number,
  mediaType: MediaType,
): Promise<TmdbTitle> {
  return memo(`title:${mediaType}:${tmdbId}`, 1000 * 60 * 20, () =>
    loadTmdbTitle(tmdbId, mediaType),
  );
}

async function loadTmdbTitle(
  tmdbId: number,
  mediaType: MediaType,
): Promise<TmdbTitle> {
  const kind = mediaType === 'MOVIE' ? 'movie' : 'tv';
  const detail = await tmdb(
    `/${kind}/${tmdbId}?append_to_response=external_ids,watch/providers`,
  );
  const extra = detail as {
    external_ids?: { imdb_id?: string | null };
    'watch/providers'?: { results?: Record<string, unknown> };
  };
  const imdbId = extra.external_ids?.imdb_id ?? null;
  const providerResults = extra['watch/providers']?.results;

  if (providerResults) {
    rememberProviders(tmdbId, mediaType, parseProviderResults(providerResults));
  }

  if (mediaType === 'MOVIE') {
    const movie = z
      .object({
        id: z.number(),
        title: z.string(),
        poster_path: z.string().nullable().optional(),
        backdrop_path: z.string().nullable().optional(),
        release_date: z.string().optional(),
        overview: z.string().optional(),
        runtime: z.number().nullable().optional(),
      })
      .parse(detail);

    return {
      tmdbId: movie.id,
      title: movie.title,
      mediaType: 'MOVIE',
      posterPath: movie.poster_path ?? null,
      backdropPath: movie.backdrop_path ?? null,
      imdbId,
      releaseDate: movie.release_date ?? null,
      overview: movie.overview ?? null,
      runtime: movie.runtime ?? null,
    };
  }

  const tv = z
    .object({
      id: z.number(),
      name: z.string(),
      poster_path: z.string().nullable().optional(),
      backdrop_path: z.string().nullable().optional(),
      first_air_date: z.string().optional(),
      overview: z.string().optional(),
      episode_run_time: z.array(z.number()).optional(),
    })
    .parse(detail);

  return {
    tmdbId: tv.id,
    title: tv.name,
    mediaType: 'TV',
    posterPath: tv.poster_path ?? null,
    backdropPath: tv.backdrop_path ?? null,
    imdbId,
    releaseDate: tv.first_air_date ?? null,
    overview: tv.overview ?? null,
    runtime: tv.episode_run_time?.[0] ?? null,
  };
}

export async function catalogTmdb(
  path: string,
  mediaType: MediaType,
): Promise<TmdbTitle[]> {
  return memo(`catalog:${path}:${mediaType}`, 1000 * 60 * 10, async () => {
    const data = (await tmdb(path)) as { results?: unknown };
    const rows = z.array(listItem).parse(data.results ?? []);

    return rows
      .filter(
        (r) =>
          !r.media_type || r.media_type === 'movie' || r.media_type === 'tv',
      )
      .slice(0, 18)
      .map((r) => {
        let mt: MediaType = mediaType;

        if (r.media_type === 'tv') {
          mt = 'TV';
        } else if (r.media_type === 'movie') {
          mt = 'MOVIE';
        }

        return mapRow(r, mt);
      });
  });
}

export async function trendingTmdb(): Promise<TmdbTitle[]> {
  return catalogTmdb('/trending/all/week', 'MOVIE');
}

const providerCache = new Map<string, { at: number; offers: WatchOffer[] }>();
const PROVIDER_TTL = 1000 * 60 * 60 * 6;

function parseProviderResults(results: Record<string, unknown>): WatchOffer[] {
  const region = (results.IN ?? results.US ?? results.GB) as
    | {
        flatrate?: { provider_name: string; logo_path: string | null }[];
        rent?: { provider_name: string; logo_path: string | null }[];
        buy?: { provider_name: string; logo_path: string | null }[];
      }
    | undefined;

  if (!region) {
    return [];
  }

  const pack = (
    rows: { provider_name: string; logo_path: string | null }[] | undefined,
    type: WatchOffer['type'],
  ) =>
    (rows ?? []).map((p) => ({
      name: p.provider_name,
      logoUrl: p.logo_path
        ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
        : null,
      type,
    }));
  const seen = new Set<string>();

  return [
    ...pack(region.flatrate, 'stream'),
    ...pack(region.rent, 'rent'),
    ...pack(region.buy, 'buy'),
  ].filter((p) => {
    if (seen.has(p.name)) {
      return false;
    }

    seen.add(p.name);

    return true;
  });
}

function rememberProviders(
  tmdbId: number,
  mediaType: MediaType,
  offers: WatchOffer[],
) {
  providerCache.set(`${mediaType}:${tmdbId}`, { at: Date.now(), offers });
}

export async function watchProviders(
  tmdbId: number,
  mediaType: MediaType,
): Promise<WatchOffer[]> {
  const key = `${mediaType}:${tmdbId}`;
  const hit = providerCache.get(key);

  if (hit && Date.now() - hit.at < PROVIDER_TTL) {
    return hit.offers;
  }

  const kind = mediaType === 'MOVIE' ? 'movie' : 'tv';
  const data = await tmdb(`/${kind}/${tmdbId}/watch/providers`);
  const offers = parseProviderResults(
    (data as { results?: Record<string, unknown> }).results ?? {},
  );

  rememberProviders(tmdbId, mediaType, offers);

  return offers;
}

export function posterUrl(path: string | null, size = 'w342') {
  if (!path) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function toClientTitle(t: TmdbTitle) {
  return {
    ...t,
    posterUrl: posterUrl(t.posterPath),
    backdropUrl: t.backdropPath
      ? `https://image.tmdb.org/t/p/w1280${t.backdropPath}`
      : null,
  };
}

export type Genre = { id: number; name: string };

export async function tmdbGenres(): Promise<Genre[]> {
  return memo('genres', 1000 * 60 * 60 * 24, async () => {
    const [movies, tv] = await Promise.all([
      tmdb('/genre/movie/list') as Promise<{ genres?: Genre[] }>,
      tmdb('/genre/tv/list') as Promise<{ genres?: Genre[] }>,
    ]);
    const byName = new Map<string, Genre>();

    for (const g of [...(movies.genres ?? []), ...(tv.genres ?? [])]) {
      if (!byName.has(g.name)) {
        byName.set(g.name, g);
      }
    }

    return [...byName.values()];
  });
}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
];

function yearParams(kind: 'movie' | 'tv', year: string) {
  if (/^\d{4}$/.test(year)) {
    return kind === 'movie'
      ? `&primary_release_year=${year}`
      : `&first_air_date_year=${year}`;
  }

  const start = year.replace('s', '');

  if (!/^\d{4}$/.test(start)) {
    return '';
  }

  const end = String(Number(start) + 9);
  const field = kind === 'movie' ? 'primary_release_date' : 'first_air_date';

  return `&${field}.gte=${start}-01-01&${field}.lte=${end}-12-31`;
}

export async function browseTmdb(opts: {
  kind: 'movie' | 'tv';
  year?: string;
  genre?: string;
  language?: string;
  person?: string;
  credit?: 'cast' | 'crew';
}): Promise<TmdbTitle[]> {
  const key = `browse:${JSON.stringify(opts)}`;

  return memo(key, 1000 * 60 * 8, async () => {
    let path = `/discover/${opts.kind}?sort_by=popularity.desc`;

    if (opts.year) {
      path += yearParams(opts.kind, opts.year);
    }

    if (opts.genre) {
      path += `&with_genres=${opts.genre}`;
    }

    if (opts.language) {
      path += `&with_original_language=${opts.language}`;
    }

    if (opts.person) {
      path +=
        opts.credit === 'crew'
          ? `&with_crew=${opts.person}`
          : `&with_cast=${opts.person}`;
    }

    return catalogTmdb(path, opts.kind === 'tv' ? 'TV' : 'MOVIE');
  });
}

export async function searchPeople(
  query: string,
  role: 'actor' | 'actress' | 'director',
) {
  const key = `people:${role}:${query.toLowerCase()}`;

  return memo(key, 1000 * 60 * 10, async () => {
    const data = (await tmdb(
      `/search/person?query=${encodeURIComponent(query)}`,
    )) as {
      results?: {
        id: number;
        name: string;
        gender?: number;
        known_for_department?: string;
        profile_path?: string | null;
      }[];
    };
    const rows = data.results ?? [];

    return rows
      .filter((p) => {
        if (role === 'director') {
          return (p.known_for_department ?? '') === 'Directing';
        }

        if (role === 'actress') {
          return p.gender === 1;
        }

        return p.gender === 2;
      })
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        name: p.name,
        image: p.profile_path
          ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
          : null,
      }));
  });
}
