import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as friendController from './friend.controller.js';

const router = Router();

router.post('/request', requireAuth, friendController.request);
router.post('/respond', requireAuth, friendController.respond);
router.get('/', requireAuth, friendController.list);

export default router;
