import type { MediaType } from '#integrations/tmdb.js';

export type RailDef = {
  id: string;
  label: string;
  kind: 'all' | 'movie' | 'tv';
  path: string;
  mediaType: MediaType;
};

export const DISCOVER_RAILS: RailDef[] = [
  {
    id: 'trending',
    label: 'This week',
    kind: 'all',
    path: '/trending/all/week',
    mediaType: 'MOVIE',
  },
  {
    id: 'now',
    label: 'In theatres',
    kind: 'movie',
    path: '/movie/now_playing',
    mediaType: 'MOVIE',
  },
  {
    id: 'upcoming',
    label: 'Coming soon',
    kind: 'movie',
    path: '/movie/upcoming',
    mediaType: 'MOVIE',
  },
  {
    id: 'popular-movies',
    label: 'Popular movies',
    kind: 'movie',
    path: '/movie/popular',
    mediaType: 'MOVIE',
  },
  {
    id: 'top',
    label: 'Top rated',
    kind: 'movie',
    path: '/movie/top_rated',
    mediaType: 'MOVIE',
  },
  {
    id: 'popular-tv',
    label: 'Popular series',
    kind: 'tv',
    path: '/tv/popular',
    mediaType: 'TV',
  },
];

export const TITLE_CACHE_MS = 1000 * 60 * 60 * 24;
