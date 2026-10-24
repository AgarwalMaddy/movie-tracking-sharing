import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';

import * as activityController from './activity.controller.js';

const router = Router();

router.get('/', requireAuth, activityController.feed);

export default router;
