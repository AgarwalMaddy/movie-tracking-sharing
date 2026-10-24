import type { RequestHandler } from 'express';

import {
  authedUserId,
  queryString,
  type AuthedRequest,
} from '#middlewares/auth.js';

import { listHistory, listLibrary } from '../library/library.service.js';
import { myLists } from '../lists/list.service.js';
import { getMyStats } from '../users/user.service.js';

export const library: RequestHandler = async (req, res, next) => {
  try {
    const entries = await listLibrary(
      authedUserId(req as AuthedRequest),
      queryString(req, 'status') || undefined,
    );

    res.json({ entries });
  } catch (error) {
    next(error);
  }
};

export const history: RequestHandler = async (req, res, next) => {
  try {
    const logs = await listHistory(authedUserId(req as AuthedRequest));

    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

export const lists: RequestHandler = async (req, res, next) => {
  try {
    const listsRows = await myLists(authedUserId(req as AuthedRequest));

    res.json({ lists: listsRows });
  } catch (error) {
    next(error);
  }
};

export const stats: RequestHandler = async (req, res, next) => {
  try {
    const payload = await getMyStats(authedUserId(req as AuthedRequest));

    res.json(payload);
  } catch (error) {
    next(error);
  }
};
