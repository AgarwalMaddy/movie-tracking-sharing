import { Router } from 'express';

import * as collectionController from './collection.controller.js';

const router = Router();

router.get('/', collectionController.list);

export default router;
