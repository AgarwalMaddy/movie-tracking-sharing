import type { RequestHandler } from 'express';

import { authedUserId, type AuthedRequest } from '#middlewares/auth.js';

import * as activityService from './activity.service.js';

export const feed: RequestHandler = async (req, res, next) => {
  try {
    const events = await activityService.getFeed(
      authedUserId(req as AuthedRequest),
    );

    res.json({ events });
  } catch (error) {
    next(error);
  }
};

export const notifications: RequestHandler = async (req, res, next) => {
  try {
    const notes = await activityService.listNotifications(
      authedUserId(req as AuthedRequest),
    );

    res.json({ notifications: notes });
  } catch (error) {
    next(error);
  }
};

export const readNotifications: RequestHandler = async (req, res, next) => {
  try {
    await activityService.markNotificationsRead(
      authedUserId(req as AuthedRequest),
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
