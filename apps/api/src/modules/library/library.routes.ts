import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as libraryController from './library.controller.js';

const router = Router();

router.put('/:mediaType/:tmdbId', requireAuth, libraryController.upsert);

export default router;
