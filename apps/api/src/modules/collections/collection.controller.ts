import type { RequestHandler } from 'express';

import { setPublicCache } from '#utils/http-cache.js';

import * as collectionService from './collection.service.js';

export const list: RequestHandler = async (_req, res, next) => {
  try {
    setPublicCache(res, 120);
    res.json(await collectionService.listCollections());
  } catch (error) {
    next(error);
  }
};
