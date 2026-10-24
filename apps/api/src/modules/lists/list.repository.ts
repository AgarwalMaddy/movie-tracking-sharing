import { db } from '#config/db.js';

export async function findByIdAndUser(id: string, userId: string) {
  return db.list.findFirst({ where: { id, userId } });
}

export async function findByUserAndSlug(userId: string, slug: string) {
  return db.list.findUnique({
    where: { userId_slug: { userId, slug } },
    include: {
      items: { include: { title: true }, orderBy: { addedAt: 'desc' } },
      user: true,
    },
  });
}

export async function findSummariesByUser(userId: string) {
  return db.list.findMany({
    where: { userId },
    include: {
      _count: { select: { items: true } },
      items: { take: 4, include: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findMine(userId: string) {
  return db.list.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findProfileLists(userId: string) {
  return db.list.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
  });
}

export async function slugTaken(userId: string, slug: string) {
  return db.list.findUnique({
    where: { userId_slug: { userId, slug } },
  });
}

export async function createList(data: {
  userId: string;
  name: string;
  slug: string;
  description?: string;
}) {
  return db.list.create({
    data: {
      userId: data.userId,
      name: data.name,
      slug: data.slug,
      description: data.description,
    },
  });
}

export async function upsertItem(data: {
  listId: string;
  titleId: string;
  userId: string;
}) {
  return db.listItem.upsert({
    where: { listId_titleId: { listId: data.listId, titleId: data.titleId } },
    create: data,
    update: {},
  });
}
