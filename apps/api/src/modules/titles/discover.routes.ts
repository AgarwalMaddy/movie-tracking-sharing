import { Router } from 'express';

import * as titleController from './title.controller.js';

const router = Router();

router.get('/', titleController.discover);
router.get('/meta', titleController.meta);
router.get('/people', titleController.people);
router.get('/browse', titleController.browse);

export default router;
