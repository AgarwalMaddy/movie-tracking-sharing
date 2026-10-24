import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as meController from './me.controller.js';

const router = Router();

router.get('/library', requireAuth, meController.library);
router.get('/history', requireAuth, meController.history);
router.get('/lists', requireAuth, meController.lists);
router.get('/stats', requireAuth, meController.stats);

export default router;
