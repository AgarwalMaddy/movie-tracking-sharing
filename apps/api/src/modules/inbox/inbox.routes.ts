import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as inboxController from './inbox.controller.js';

const router = Router();

router.get('/', requireAuth, inboxController.list);
router.post('/:id/accept', requireAuth, inboxController.accept);

export default router;
