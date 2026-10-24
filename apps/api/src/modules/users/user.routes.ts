import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as userController from './user.controller.js';

const router = Router();

router.get('/search', requireAuth, userController.search);
router.get('/:username/lists', userController.lists);
router.get('/:username', userController.show);

export default router;
