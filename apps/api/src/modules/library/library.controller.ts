import type { RequestHandler } from 'express';

import {
  authedUserId,
  paramString,
  type AuthedRequest,
} from '#middlewares/auth.js';

import { upsertLibrarySchema } from './library.schema.js';
import * as libraryService from './library.service.js';

export const upsert: RequestHandler = async (req, res, next) => {
  try {
    const input = upsertLibrarySchema.parse(req.body);
    const mediaType =
      paramString(req, 'mediaType').toUpperCase() === 'TV' ? 'TV' : 'MOVIE';
    const entry = await libraryService.upsertLibrary(
      authedUserId(req as AuthedRequest),
      Number(paramString(req, 'tmdbId')),
      mediaType,
      input,
    );

    res.json({ entry });
  } catch (error) {
    next(error);
  }
};
