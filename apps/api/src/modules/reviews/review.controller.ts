import type { RequestHandler } from 'express';

import { authedUserId, type AuthedRequest } from '#middlewares/auth.js';

import { upsertReviewSchema } from './review.schema.js';
import * as reviewService from './review.service.js';

export const create: RequestHandler = async (req, res, next) => {
  try {
    const input = upsertReviewSchema.parse(req.body);
    const review = await reviewService.upsertReview(
      authedUserId(req as AuthedRequest),
      input,
    );

    res.json({ review });
  } catch (error) {
    next(error);
  }
};

export const list: RequestHandler = async (_req, res, next) => {
  try {
    const reviews = await reviewService.listReviews();

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};
