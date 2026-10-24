import { NotFoundError } from '#errors/app-error.js';
import { toPublicUser } from '#utils/to-public-user.js';

import { findProfileLists } from '../lists/list.repository.js';
import { publicTitle } from '../titles/title.service.js';

import * as userRepository from './user.repository.js';

export async function searchUsers(query: string) {
  const q = query.trim().toLowerCase();

  if (q.length < 2) {
    return [];
  }

  const users = await userRepository.searchByUsername(q);

  return users.map(toPublicUser);
}

export async function getProfile(username: string) {
  const user = await userRepository.findUserByUsername(username);

  if (!user) {
    throw new NotFoundError();
  }

  const [library, lists, reviews, logs] = await Promise.all([
    userRepository.findLibraryPreview(user.id),
    findProfileLists(user.id),
    userRepository.countReviews(user.id),
    userRepository.findWatchLogs(user.id),
  ]);
  const hours = Math.round(
    logs.reduce((acc, _l, i) => acc + (library[i]?.title.runtime ?? 100), 0) /
      60,
  );

  return {
    user: toPublicUser(user),
    stats: {
      titles: library.filter((e) => e.status === 'WATCHED').length,
      lists: lists.length,
      reviews,
      watchLogs: logs.length,
      hours,
    },
    recently: library.map((e) => ({
      status: e.status,
      rating: e.rating,
      title: publicTitle(e.title),
    })),
    lists: lists.map((l) => ({
      name: l.name,
      slug: l.slug,
      itemCount: l._count.items,
    })),
  };
}

export async function getMyStats(userId: string) {
  const [entries, logs, reviews, lists] = await Promise.all([
    userRepository.findLibraryWithTitles(userId),
    userRepository.findWatchLogsWithTitles(userId),
    userRepository.countReviews(userId),
    userRepository.countLists(userId),
  ]);
  const minutes = entries.reduce((a, e) => a + (e.title.runtime ?? 0), 0);

  return {
    watched: entries.filter((e) => e.status === 'WATCHED').length,
    watching: entries.filter((e) => e.status === 'WATCHING').length,
    want: entries.filter((e) => e.status === 'WANT').length,
    reviews,
    lists,
    logs: logs.length,
    hours: Math.round(minutes / 60),
    byType: {
      movies: entries.filter((e) => e.title.mediaType === 'MOVIE').length,
      shows: entries.filter((e) => e.title.mediaType === 'TV').length,
    },
  };
}
