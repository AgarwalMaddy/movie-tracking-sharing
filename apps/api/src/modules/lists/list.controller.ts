import type { RequestHandler } from 'express';

import {
  authedUserId,
  paramString,
  queryString,
  type AuthedRequest,
} from '#middlewares/auth.js';

import { addListItemSchema, createListSchema } from './list.schema.js';
import * as listService from './list.service.js';

export const create: RequestHandler = async (req, res, next) => {
  try {
    const input = createListSchema.parse(req.body);
    const list = await listService.createList(
      authedUserId(req as AuthedRequest),
      input,
    );

    res.json({ list });
  } catch (error) {
    next(error);
  }
};

export const addItem: RequestHandler = async (req, res, next) => {
  try {
    const input = addListItemSchema.parse(req.body);
    const item = await listService.addListItem(
      authedUserId(req as AuthedRequest),
      paramString(req, 'id'),
      input,
    );

    res.json({ item });
  } catch (error) {
    next(error);
  }
};

export const browse: RequestHandler = async (req, res, next) => {
  try {
    const lists = await listService.browsePublicLists(queryString(req, 'q'));

    res.json({ lists });
  } catch (error) {
    next(error);
  }
};

export const showBySlug: RequestHandler = async (req, res, next) => {
  try {
    const list = await listService.getListByUsernameSlug(
      paramString(req, 'username'),
      paramString(req, 'slug'),
    );

    res.json({ list });
  } catch (error) {
    next(error);
  }
};
