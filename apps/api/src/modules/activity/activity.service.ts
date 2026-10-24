import { toPublicUser } from '#utils/to-public-user.js';

import * as activityRepository from './activity.repository.js';

export async function getFeed(userId: string) {
  const friendIds = await activityRepository.findFriendIds(userId);
  const events = await activityRepository.findFeedFor([userId, ...friendIds]);

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
