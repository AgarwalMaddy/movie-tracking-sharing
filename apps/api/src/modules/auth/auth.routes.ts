import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';
import { authLimiter } from '#middlewares/rate-limit.js';

import * as authController from './auth.controller.js';

const router = Router();

router.use(authLimiter);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.get('/verify-email', authController.verifyEmail);

export default router;
