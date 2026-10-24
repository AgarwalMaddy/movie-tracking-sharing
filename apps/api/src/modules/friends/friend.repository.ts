import { db } from '#config/db.js';

export async function upsertRequest(requesterId: string, recipientId: string) {
  return db.friendRequest.upsert({
    where: {
      requesterId_recipientId: { requesterId, recipientId },
    },
    create: { requesterId, recipientId },
    update: { status: 'PENDING' },
  });
}

export async function findIncomingRequest(id: string, recipientId: string) {
  return db.friendRequest.findFirst({
    where: { id, recipientId },
  });
}

export async function declineRequest(id: string) {
  await db.friendRequest.update({
    where: { id },
    data: { status: 'DECLINED' },
  });
}

export async function acceptRequest(
  requestId: string,
  userId: string,
  requesterId: string,
) {
  await db.$transaction([
    db.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    }),
    db.friendship.upsert({
      where: { userId_friendId: { userId, friendId: requesterId } },
      create: { userId, friendId: requesterId },
      update: {},
    }),
    db.friendship.upsert({
      where: {
        userId_friendId: { userId: requesterId, friendId: userId },
      },
      create: { userId: requesterId, friendId: userId },
      update: {},
    }),
  ]);
}

export async function findFriends(userId: string) {
  return db.friendship.findMany({
    where: { userId },
    include: { friend: true },
  });
}

export async function findIncoming(userId: string) {
  return db.friendRequest.findMany({
    where: { recipientId: userId, status: 'PENDING' },
    include: { requester: true },
  });
}

export async function findBond(userId: string, friendId: string) {
  return db.friendship.findUnique({
    where: { userId_friendId: { userId, friendId } },
  });
}
