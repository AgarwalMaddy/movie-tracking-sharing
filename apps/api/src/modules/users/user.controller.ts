import type { RequestHandler } from 'express';

import { paramString, queryString } from '#middlewares/auth.js';

import { listsForUsername } from '../lists/list.service.js';

import * as userService from './user.service.js';

export const search: RequestHandler = async (req, res, next) => {
  try {
    const users = await userService.searchUsers(queryString(req, 'q'));

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const show: RequestHandler = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(paramString(req, 'username'));

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const lists: RequestHandler = async (req, res, next) => {
  try {
    const listsRows = await listsForUsername(paramString(req, 'username'));

    res.json({ lists: listsRows });
  } catch (error) {
    next(error);
  }
};
