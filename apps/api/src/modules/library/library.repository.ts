import type { WatchStatus } from '@prisma/client';

import { db } from '#config/db.js';

export async function upsertEntry(data: {
  userId: string;
  titleId: string;
  status: WatchStatus;
  rating: number | null | undefined;
  note: string | null | undefined;
}) {
  return db.libraryEntry.upsert({
    where: { userId_titleId: { userId: data.userId, titleId: data.titleId } },
    create: {
      userId: data.userId,
      titleId: data.titleId,
      status: data.status,
      rating: data.rating ?? null,
      note: data.note ?? null,
    },
    update: {
      status: data.status,
      rating: data.rating === undefined ? undefined : data.rating,
      note: data.note === undefined ? undefined : data.note,
    },
  });
}

export async function createWatchLog(userId: string, titleId: string) {
  await db.watchLog.create({ data: { userId, titleId } });
}

export async function listEntries(userId: string, status?: string) {
  return db.libraryEntry.findMany({
    where: {
      userId,
      ...(status ? { status: status as WatchStatus } : {}),
    },
    include: { title: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function listHistory(userId: string) {
  return db.watchLog.findMany({
    where: { userId },
    include: { title: true },
    orderBy: { watchedAt: 'desc' },
    take: 50,
  });
}
