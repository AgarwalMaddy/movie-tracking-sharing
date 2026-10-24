import type { ActivityType } from '@prisma/client';

import { db } from '#config/db.js';

export async function logActivity(
  actorId: string,
  type: ActivityType,
  payload: object,
) {
  await db.activityEvent.create({ data: { actorId, type, payload } });
}

export async function notify(userId: string, body: string) {
  await db.notification.create({ data: { userId, body } });
}

export async function findFeedFor(userIds: string[]) {
  return db.activityEvent.findMany({
    where: { actorId: { in: userIds } },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function findRecent() {
  return db.activityEvent.findMany({
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function findNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function markNotificationsRead(userId: string) {
  await db.notification.updateMany({
    where: { userId },
    data: { read: true },
  });
}

export async function findFriendIds(userId: string) {
  const friends = await db.friendship.findMany({
    where: { userId },
  });

  return friends.map((f) => f.friendId);
}
