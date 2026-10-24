import type { TmdbTitle } from '#integrations/tmdb.js';

import { DISCOVER_RAILS, type RailDef } from './title.constants.js';

const MOVIES: TmdbTitle[] = [
  {
    tmdbId: 155,
    title: 'The Dark Knight',
    mediaType: 'MOVIE',
    posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPath: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    imdbId: 'tt0468569',
    releaseDate: '2008-07-16',
    overview:
      'Batman, Gordon, and Harvey Dent take on the Joker as Gotham teeters.',
    runtime: 152,
  },
  {
    tmdbId: 157336,
    title: 'Interstellar',
    mediaType: 'MOVIE',
    posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    imdbId: 'tt0816692',
    releaseDate: '2014-11-05',
    overview: 'A crew leaves Earth through a wormhole in search of a new home.',
    runtime: 169,
  },
  {
    tmdbId: 238,
    title: 'The Godfather',
    mediaType: 'MOVIE',
    posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdropPath: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    imdbId: 'tt0068646',
    releaseDate: '1972-03-14',
    overview:
      'The aging patriarch of a crime family hands the reins to his son.',
    runtime: 175,
  },
  {
    tmdbId: 603,
    title: 'The Matrix',
    mediaType: 'MOVIE',
    posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdropPath: '/icmmSD4fQJSxesZdOSz9bO7mp0q.jpg',
    imdbId: 'tt0133093',
    releaseDate: '1999-03-30',
    overview: 'A hacker learns the world is a simulation and joins the fight.',
    runtime: 136,
  },
  {
    tmdbId: 11,
    title: 'Star Wars',
    mediaType: 'MOVIE',
    posterPath: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
    backdropPath: '/zqkmTXzoDFf7z4JOPrXbimpmynU.jpg',
    imdbId: 'tt0076759',
    releaseDate: '1977-05-25',
    overview: 'A farm boy, a princess, and a smuggler take on an empire.',
    runtime: 121,
  },
  {
    tmdbId: 278,
    title: 'The Shawshank Redemption',
    mediaType: 'MOVIE',
    posterPath: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdropPath: '/kXfqcdQKsA0pQA5xk4lI56m7UoU.jpg',
    imdbId: 'tt0111161',
    releaseDate: '1994-09-23',
    overview: 'Two imprisoned men find a way through decades of confinement.',
    runtime: 142,
  },
  {
    tmdbId: 27205,
    title: 'Inception',
    mediaType: 'MOVIE',
    posterPath: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdropPath: '/s3TBrKgk8q6qj2xfRcQzOjUA8M.jpg',
    imdbId: 'tt1375666',
    releaseDate: '2010-07-15',
    overview: 'A thief who steals secrets from dreams is offered one last job.',
    runtime: 148,
  },
  {
    tmdbId: 129,
    title: 'Spirited Away',
    mediaType: 'MOVIE',
    posterPath: '/dL11DBPcRhWWnJcFXl9A07MrqTI.jpg',
    backdropPath: '/mSDsSDwaP3E7dEfUPWyC6hGMAbP.jpg',
    imdbId: 'tt0245429',
    releaseDate: '2001-07-20',
    overview:
      'A girl wanders into a bathhouse for spirits and has to earn her way out.',
    runtime: 125,
  },
];

const SERIES: TmdbTitle[] = [
  {
    tmdbId: 1396,
    title: 'Breaking Bad',
    mediaType: 'TV',
    posterPath: '/ztkUQFLlC19CCMYHT9h5WCqgUKE.jpg',
    backdropPath: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    imdbId: 'tt0903747',
    releaseDate: '2008-01-20',
    overview:
      'A chemistry teacher turns to cooking meth after a cancer diagnosis.',
    runtime: 49,
  },
  {
    tmdbId: 66732,
    title: 'Stranger Things',
    mediaType: 'TV',
    posterPath: '/49WJfeN0moxb9IPfGn8AIqARPAk.jpg',
    backdropPath: '/56v2KjBlU4XaOv9rVYEQypTWTw.jpg',
    imdbId: 'tt4574334',
    releaseDate: '2016-07-15',
    overview: 'Kids in Hawkins find a girl, a lab, and another world.',
    runtime: 51,
  },
  {
    tmdbId: 100088,
    title: 'The Last of Us',
    mediaType: 'TV',
    posterPath: '/uKvVjHNqB7DbUg39ouvzA42qEub.jpg',
    backdropPath: '/uDgy6hyPd82kOGhWFk2tqGh9LbA.jpg',
    imdbId: 'tt3581920',
    releaseDate: '2023-01-15',
    overview: 'A smuggler escorts a girl across a ruined United States.',
    runtime: 60,
  },
  {
    tmdbId: 76479,
    title: 'The Boys',
    mediaType: 'TV',
    posterPath: '/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg',
    backdropPath: '/mGVrXeIjyecj6fKOOHL9vOxYd9W.jpg',
    imdbId: 'tt1190634',
    releaseDate: '2019-07-26',
    overview:
      'Vigilantes take on corrupt superheroes who are really celebrities.',
    runtime: 60,
  },
];

const MIXED = [...MOVIES.slice(0, 6), ...SERIES.slice(0, 4)];

const BY_RAIL: Record<string, TmdbTitle[]> = {
  trending: MIXED,
  now: MOVIES.slice(0, 6),
  upcoming: MOVIES.slice(2, 8),
  'popular-movies': MOVIES,
  top: MOVIES,
  'popular-tv': SERIES,
};

export const FALLBACK_CAST: {
  id: number;
  name: string;
  character: string | null;
  profilePath: string | null;
}[] = [
  {
    id: 3894,
    name: 'Christian Bale',
    character: 'Bruce Wayne / Batman',
    profilePath: '/qCpZn2o3XQTVgCG3lCD6rbRmv7N.jpg',
  },
  {
    id: 1810,
    name: 'Heath Ledger',
    character: 'Joker',
    profilePath: '/5Y9HnYYa9jF4NunY9lSg6plyRvh.jpg',
  },
  {
    id: 3895,
    name: 'Aaron Eckhart',
    character: 'Harvey Dent',
    profilePath: '/4XAtNFiZgNWJ5XNyYQmywqgPzqS.jpg',
  },
  {
    id: 1813,
    name: 'Maggie Gyllenhaal',
    character: 'Rachel Dawes',
    profilePath: '/2qv4eivqJ0vDIhfzCZqK0TzL5dJ.jpg',
  },
  {
    id: 3896,
    name: 'Michael Caine',
    character: 'Alfred',
    profilePath: '/hZruclwEOTRegAfpBifKzYfbXjg.jpg',
  },
];

export function fallbackFeatured(): TmdbTitle {
  return MOVIES[0];
}

export function fallbackRail(def: RailDef): TmdbTitle[] {
  return BY_RAIL[def.id] ?? MIXED;
}

export function fallbackRails() {
  return DISCOVER_RAILS.map((def) => ({
    id: def.id,
    label: def.label,
    kind: def.kind,
    titles: fallbackRail(def),
  }));
}
