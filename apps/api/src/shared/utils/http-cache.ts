import type { Response } from 'express';

export function setPublicCache(res: Response, maxAge = 60) {
  res.setHeader(
    'Cache-Control',
    `public, max-age=${String(maxAge)}, stale-while-revalidate=${String(maxAge * 10)}`,
  );
}
