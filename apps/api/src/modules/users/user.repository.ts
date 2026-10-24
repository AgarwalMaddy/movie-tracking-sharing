import { db } from '#config/db.js';

export async function findUserByUsername(username: string) {
  return db.user.findUnique({ where: { username } });
}

export async function searchByUsername(q: string) {
  return db.user.findMany({
    where: { username: { contains: q, mode: 'insensitive' } },
    take: 20,
  });
}

export async function findLibraryPreview(userId: string) {
  return db.libraryEntry.findMany({
    where: { userId },
    include: { title: true },
    take: 24,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function countReviews(userId: string) {
  return db.review.count({ where: { userId } });
}

export async function findWatchLogs(userId: string) {
  return db.watchLog.findMany({ where: { userId } });
}

export async function findLibraryWithTitles(userId: string) {
  return db.libraryEntry.findMany({
    where: { userId },
    include: { title: true },
  });
}

export async function findWatchLogsWithTitles(userId: string) {
  return db.watchLog.findMany({
    where: { userId },
    include: { title: true },
  });
}

export async function countLists(userId: string) {
  return db.list.count({ where: { userId } });
}
