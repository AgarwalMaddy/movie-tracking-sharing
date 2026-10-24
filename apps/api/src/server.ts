import { env } from '#config/env.js';

import app from './app.js';
import { seedCollections } from './modules/collections/collection.seed.js';

app.listen(env.PORT, '0.0.0.0', () => {
  console.warn(`API http://localhost:${String(env.PORT)}`);
  seedCollections().catch((e: unknown) => {
    console.warn('seed skipped', e instanceof Error ? e.message : e);
  });
});
