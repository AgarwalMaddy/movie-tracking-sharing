import { db } from '#config/db.js';

export async function findAll() {
  return db.collection.findMany({
    include: {
      items: { include: { title: true }, orderBy: { sortOrder: 'asc' } },
    },
  });
}

export async function findBySlug(slug: string) {
  return db.collection.findUnique({
    where: { slug },
    include: { items: true },
  });
}

export async function createCollection(data: {
  slug: string;
  name: string;
  description: string;
}) {
  return db.collection.create({
    data,
    include: { items: true },
  });
}

export async function addItem(
  collectionId: string,
  titleId: string,
  sortOrder: number,
) {
  await db.collectionItem.create({
    data: { collectionId, titleId, sortOrder },
  });
}

export async function findTitle(tmdbId: number, mediaType: 'MOVIE' | 'TV') {
  return db.title.findUnique({
    where: { tmdbId_mediaType: { tmdbId, mediaType } },
  });
}
