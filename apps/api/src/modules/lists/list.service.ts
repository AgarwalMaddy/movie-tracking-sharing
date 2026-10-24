import { randomBytes } from 'node:crypto';

import { NotFoundError } from '#errors/app-error.js';
import { slugify } from '#utils/slugify.js';
import { toPublicUser } from '#utils/to-public-user.js';

import { logActivity } from '../activity/activity.repository.js';
import { getOrFetchTitle, publicTitle } from '../titles/title.service.js';
import { findUserByUsername } from '../users/user.repository.js';

import * as listRepository from './list.repository.js';
import type { AddListItemInput, CreateListInput } from './list.schema.js';

export async function createList(userId: string, input: CreateListInput) {
  let slug = slugify(input.name);
  const clash = await listRepository.slugTaken(userId, slug);

  if (clash) {
    slug = `${slug}-${randomBytes(2).toString('hex')}`;
  }

  const list = await listRepository.createList({
    userId,
    name: input.name,
    slug,
    description: input.description,
  });

  await logActivity(userId, 'LIST_CREATE', {
    listId: list.id,
    name: list.name,
  });

  return list;
}

export async function addListItem(
  userId: string,
  listId: string,
  input: AddListItemInput,
) {
  const list = await listRepository.findByIdAndUser(listId, userId);

  if (!list) {
    throw new NotFoundError();
  }

  const title = await getOrFetchTitle(input.tmdbId, input.mediaType);
  const item = await listRepository.upsertItem({
    listId: list.id,
    titleId: title.id,
    userId,
  });

  await logActivity(userId, 'LIST_ADD', {
    listId: list.id,
    title: title.title,
  });

  return item;
}

export async function getListByUsernameSlug(username: string, slug: string) {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new NotFoundError();
  }

  const list = await listRepository.findByUserAndSlug(user.id, slug);

  if (!list) {
    throw new NotFoundError();
  }

  return {
    ...list,
    items: list.items.map((i) => ({ ...i, title: publicTitle(i.title) })),
    user: toPublicUser(list.user),
  };
}

export async function browsePublicLists(q = '') {
  const lists = await listRepository.findRecent(q);

  return lists
    .filter((l) => l.user.username)
    .map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      description: l.description,
      itemCount: l._count.items,
      posters: l.items.map((i) => publicTitle(i.title).posterUrl),
      user: toPublicUser(l.user),
    }));
}

export async function listsForUsername(username: string) {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new NotFoundError();
  }

  const lists = await listRepository.findSummariesByUser(user.id);

  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    description: l.description,
    itemCount: l._count.items,
    posters: l.items.map((i) => publicTitle(i.title).posterUrl),
  }));
}

export async function myLists(userId: string) {
  const lists = await listRepository.findMine(userId);

  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    itemCount: l._count.items,
  }));
}
