import { NotFoundError } from '#errors/app-error.js';
import { toPublicUser } from '#utils/to-public-user.js';

import { logActivity, notify } from '../activity/activity.repository.js';
import { requireFriendship } from '../friends/friend.service.js';
import { getOrFetchTitle, publicTitle } from '../titles/title.service.js';
import { findUserByUsername } from '../users/user.repository.js';

import * as inboxRepository from './inbox.repository.js';
import type { RecommendInput } from './inbox.schema.js';

export async function recommend(userId: string, input: RecommendInput) {
  const other = await findUserByUsername(input.username.toLowerCase());

  if (!other) {
    throw new NotFoundError('User not found');
  }

  await requireFriendship(userId, other.id);

  const title = await getOrFetchTitle(input.tmdbId, input.mediaType);
  const suggestion = await inboxRepository.createSuggestion({
    senderId: userId,
    recipientId: other.id,
    titleId: title.id,
    message: input.message,
  });

  await logActivity(userId, 'RECOMMEND', {
    title: title.title,
    to: other.username,
  });
  await notify(other.id, `Recommended: ${title.title}`);

  return suggestion;
}

export async function listInbox(userId: string) {
  const items = await inboxRepository.findInbox(userId);

  return items.map((s) => ({
    id: s.id,
    message: s.message,
    status: s.status,
    sender: toPublicUser(s.sender),
    title: publicTitle(s.title),
  }));
}

export async function acceptSuggestion(userId: string, id: string) {
  const suggestion = await inboxRepository.findOwned(id, userId);

  if (!suggestion) {
    throw new NotFoundError();
  }

  await inboxRepository.acceptSuggestion(suggestion.id);
  await inboxRepository.addWant(userId, suggestion.titleId);
}
