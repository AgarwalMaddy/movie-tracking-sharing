import type { RequestHandler } from 'express';

import {
  authedUserId,
  paramString,
  type AuthedRequest,
} from '#middlewares/auth.js';

import { recommendSchema } from './inbox.schema.js';
import * as inboxService from './inbox.service.js';

export const recommend: RequestHandler = async (req, res, next) => {
  try {
    const input = recommendSchema.parse(req.body);
    const suggestion = await inboxService.recommend(
      authedUserId(req as AuthedRequest),
      input,
    );

    res.json({ suggestion });
  } catch (error) {
    next(error);
  }
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    const items = await inboxService.listInbox(
      authedUserId(req as AuthedRequest),
    );

    res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const accept: RequestHandler = async (req, res, next) => {
  try {
    await inboxService.acceptSuggestion(
      authedUserId(req as AuthedRequest),
      paramString(req, 'id'),
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
