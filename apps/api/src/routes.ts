import { Router } from 'express';

import activityRoutes from './modules/activity/activity.routes.js';
import notificationRoutes from './modules/activity/notification.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import collectionRoutes from './modules/collections/collection.routes.js';
import friendRoutes from './modules/friends/friend.routes.js';
import inboxRoutes from './modules/inbox/inbox.routes.js';
import recommendRoutes from './modules/inbox/recommend.routes.js';
import libraryRoutes from './modules/library/library.routes.js';
import listRoutes from './modules/lists/list.routes.js';
import meRoutes from './modules/me/me.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import discoverRoutes from './modules/titles/discover.routes.js';
import titleRoutes from './modules/titles/title.routes.js';
import userRoutes from './modules/users/user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/titles', titleRoutes);
router.use('/discover', discoverRoutes);
router.use('/library', libraryRoutes);
router.use('/lists', listRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
router.use('/friends', friendRoutes);
router.use('/recommend', recommendRoutes);
router.use('/inbox', inboxRoutes);
router.use('/activity', activityRoutes);
router.use('/collections', collectionRoutes);
router.use('/me', meRoutes);
router.use('/notifications', notificationRoutes);

export default router;
