import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as inboxController from './inbox.controller.js';

const router = Router();

router.post('/', requireAuth, inboxController.recommend);

export default router;
