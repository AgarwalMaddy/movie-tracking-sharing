import { toPublicUser } from '#utils/to-public-user.js';

import * as activityRepository from './activity.repository.js';

export async function getFeed(userId?: string) {
  const events = userId
    ? await activityRepository.findFeedFor([
        userId,
        ...(await activityRepository.findFriendIds(userId)),
      ])
    : await activityRepository.findRecent();

  return events.map((e) => ({
    id: e.id,
    type: e.type,
    payload: e.payload,
    createdAt: e.createdAt,
    actor: toPublicUser(e.actor),
  }));
}

export async function listNotifications(userId: string) {
  return activityRepository.findNotifications(userId);
}

export async function markNotificationsRead(userId: string) {
  await activityRepository.markNotificationsRead(userId);
}
