import { db } from '#config/db.js';

export async function upsertReview(data: {
  userId: string;
  titleId: string;
  body: string;
  rating: number | undefined;
}) {
  return db.review.upsert({
    where: { userId_titleId: { userId: data.userId, titleId: data.titleId } },
    create: data,
    update: { body: data.body, rating: data.rating },
  });
}

export async function findRecent() {
  return db.review.findMany({
    include: { user: true, title: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
}
