import { db } from '#config/db.js';

export async function createSuggestion(data: {
  senderId: string;
  recipientId: string;
  titleId: string;
  message: string;
}) {
  return db.suggestion.create({ data });
}

export async function findInbox(userId: string) {
  return db.suggestion.findMany({
    where: { recipientId: userId },
    include: { sender: true, title: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findOwned(id: string, recipientId: string) {
  return db.suggestion.findFirst({
    where: { id, recipientId },
  });
}

export async function acceptSuggestion(id: string) {
  await db.suggestion.update({
    where: { id },
    data: { status: 'ACCEPTED' },
  });
}

export async function addWant(userId: string, titleId: string) {
  await db.libraryEntry.upsert({
    where: { userId_titleId: { userId, titleId } },
    create: { userId, titleId, status: 'WANT' },
    update: {},
  });
}
