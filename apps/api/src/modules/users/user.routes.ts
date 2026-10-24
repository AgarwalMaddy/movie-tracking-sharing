import { Router } from 'express';

import * as userController from './user.controller.js';

const router = Router();

router.get('/search', userController.search);
router.get('/:username/lists', userController.lists);
router.get('/:username', userController.show);

export default router;
