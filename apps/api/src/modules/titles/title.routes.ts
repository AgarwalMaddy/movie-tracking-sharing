import { Router } from 'express';

import * as titleController from './title.controller.js';

const router = Router();

router.get('/search', titleController.search);
router.get('/:mediaType/:tmdbId', titleController.show);

export default router;
