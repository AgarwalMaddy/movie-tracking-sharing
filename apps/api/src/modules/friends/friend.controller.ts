import type { RequestHandler } from 'express';

import { authedUserId, type AuthedRequest } from '#middlewares/auth.js';

import { friendRequestSchema, friendRespondSchema } from './friend.schema.js';
import * as friendService from './friend.service.js';

export const request: RequestHandler = async (req, res, next) => {
  try {
    const input = friendRequestSchema.parse(req.body);
    const requestRow = await friendService.requestFriend(
      authedUserId(req as AuthedRequest),
      input,
    );

    res.json({ request: requestRow });
  } catch (error) {
    next(error);
  }
};

export const respond: RequestHandler = async (req, res, next) => {
  try {
    const input = friendRespondSchema.parse(req.body);

    await friendService.respondToRequest(
      authedUserId(req as AuthedRequest),
      input,
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    const payload = await friendService.listFriends(
      authedUserId(req as AuthedRequest),
    );

    res.json(payload);
  } catch (error) {
    next(error);
  }
};
