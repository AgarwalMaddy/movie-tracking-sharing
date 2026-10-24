import { AppError, NotFoundError, ValidationError } from '#errors/app-error.js';
import { toPublicUser } from '#utils/to-public-user.js';

import { logActivity, notify } from '../activity/activity.repository.js';
import { findUserByUsername } from '../users/user.repository.js';

import * as friendRepository from './friend.repository.js';
import type {
  FriendRequestInput,
  FriendRespondInput,
} from './friend.schema.js';

export async function requestFriend(userId: string, input: FriendRequestInput) {
  const other = await findUserByUsername(input.username.toLowerCase());

  if (!other) {
    throw new NotFoundError('User not found');
  }

  if (other.id === userId) {
    throw new ValidationError('That is you');
  }

  const request = await friendRepository.upsertRequest(userId, other.id);

  await notify(other.id, 'New friend request');

  return request;
}

export async function respondToRequest(
  userId: string,
  input: FriendRespondInput,
) {
  const fr = await friendRepository.findIncomingRequest(
    input.requestId,
    userId,
  );

  if (!fr) {
    throw new NotFoundError();
  }

  if (!input.accept) {
    await friendRepository.declineRequest(fr.id);

    return;
  }

  await friendRepository.acceptRequest(fr.id, userId, fr.requesterId);
  await logActivity(userId, 'FRIEND', { friendId: fr.requesterId });
}

export async function listFriends(userId: string) {
  const [friends, incoming] = await Promise.all([
    friendRepository.findFriends(userId),
    friendRepository.findIncoming(userId),
  ]);

  return {
    friends: friends.map((f) => toPublicUser(f.friend)),
    incoming: incoming.map((r) => ({
      id: r.id,
      user: toPublicUser(r.requester),
    })),
  };
}

export async function requireFriendship(userId: string, friendId: string) {
  const bond = await friendRepository.findBond(userId, friendId);

  if (!bond) {
    throw new AppError({ code: 'NOT_FRIENDS' });
  }
}
