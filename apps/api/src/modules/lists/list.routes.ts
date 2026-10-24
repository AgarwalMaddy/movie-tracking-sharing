import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as listController from './list.controller.js';

const router = Router();

router.post('/', requireAuth, listController.create);
router.post('/:id/items', requireAuth, listController.addItem);
router.get('/:username/:slug', listController.showBySlug);

export default router;
