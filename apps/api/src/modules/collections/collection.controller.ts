import type { RequestHandler } from 'express';

import * as collectionService from './collection.service.js';

export const list: RequestHandler = async (_req, res, next) => {
  try {
    res.json(await collectionService.listCollections());
  } catch (error) {
    next(error);
  }
};
