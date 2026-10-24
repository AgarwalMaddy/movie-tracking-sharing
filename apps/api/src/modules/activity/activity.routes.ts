import { Router } from 'express';

import * as activityController from './activity.controller.js';

const router = Router();

router.get('/', activityController.feed);

export default router;
