import { memo } from '#utils/cache.js';

import { publicTitle } from '../titles/title.service.js';

import * as collectionRepository from './collection.repository.js';

export async function listCollections() {
  return memo('collections:all', 1000 * 60 * 5, async () => {
    const cols = await collectionRepository.findAll();

    return {
      collections: cols.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        titles: c.items.map((i) => publicTitle(i.title)),
      })),
    };
  });
}
