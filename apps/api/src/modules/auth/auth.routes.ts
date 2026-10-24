import { Router } from 'express';

import { requireAuth } from '#middlewares/auth.js';
import { authLimiter } from '#middlewares/rate-limit.js';

import * as authController from './auth.controller.js';

const router = Router();

router.use(authLimiter);
router.get('/providers', authController.providers);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/demo', authController.demo);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.get('/verify-email', authController.verifyEmail);
router.get('/google', authController.googleStart);
router.get('/google/callback', authController.googleCallback);

export default router;
