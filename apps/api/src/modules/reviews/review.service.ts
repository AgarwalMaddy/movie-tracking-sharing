import { toPublicUser } from '#utils/to-public-user.js';

import { logActivity } from '../activity/activity.repository.js';
import { getOrFetchTitle, publicTitle } from '../titles/title.service.js';

import * as reviewRepository from './review.repository.js';
import type { UpsertReviewInput } from './review.schema.js';

export async function upsertReview(userId: string, input: UpsertReviewInput) {
  const title = await getOrFetchTitle(input.tmdbId, input.mediaType);
  const review = await reviewRepository.upsertReview({
    userId,
    titleId: title.id,
    body: input.body,
    rating: input.rating,
  });

  await logActivity(userId, 'REVIEW', {
    titleId: title.id,
    title: title.title,
  });

  return review;
}

export async function listReviews() {
  const reviews = await reviewRepository.findRecent();

  return reviews.map((r) => ({
    id: r.id,
    body: r.body,
    rating: r.rating,
    createdAt: r.createdAt,
    user: toPublicUser(r.user),
    title: publicTitle(r.title),
  }));
}
