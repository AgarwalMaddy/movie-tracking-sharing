import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as reviewController from './review.controller.js';

const router = Router();

router.post('/', requireAuth, reviewController.create);
router.get('/', reviewController.list);

export default router;
