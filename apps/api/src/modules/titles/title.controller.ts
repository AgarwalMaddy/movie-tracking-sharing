import type { RequestHandler } from 'express';

import { ValidationError } from '#errors/app-error.js';
import {
  paramString,
  queryString,
  type AuthedRequest,
} from '#middlewares/auth.js';
import { setPublicCache } from '#utils/http-cache.js';

import * as titleService from './title.service.js';

export const search: RequestHandler = async (req, res, next) => {
  try {
    const results = await titleService.searchTitles(
      queryString(req, 'q').trim(),
    );

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

export const discover: RequestHandler = async (_req, res, next) => {
  try {
    setPublicCache(res, 60);
    res.json(await titleService.discoverRails());
  } catch (error) {
    next(error);
  }
};

export const meta: RequestHandler = async (_req, res, next) => {
  try {
    res.json(await titleService.discoverMeta());
  } catch (error) {
    next(error);
  }
};

export const people: RequestHandler = async (req, res, next) => {
  try {
    const role = queryString(req, 'role', 'actor');

    if (
      role !== 'actor' &&
      role !== 'actress' &&
      role !== 'director' &&
      role !== 'cast'
    ) {
      throw new ValidationError('Bad role');
    }

    const peopleRows = await titleService.discoverPeople(
      queryString(req, 'q').trim(),
      role,
    );

    res.json({ people: peopleRows });
  } catch (error) {
    next(error);
  }
};

export const browse: RequestHandler = async (req, res, next) => {
  try {
    const titles = await titleService.browseTitles({
      kind: queryString(req, 'kind', 'movie') === 'tv' ? 'tv' : 'movie',
      year: queryString(req, 'year') || undefined,
      genre: queryString(req, 'genre') || undefined,
      language: queryString(req, 'language') || undefined,
      person: queryString(req, 'person') || undefined,
      credit: queryString(req, 'credit', 'cast') === 'crew' ? 'crew' : 'cast',
    });

    res.json({ titles });
  } catch (error) {
    next(error);
  }
};

export const show: RequestHandler = async (req, res, next) => {
  try {
    const mediaType =
      paramString(req, 'mediaType').toUpperCase() === 'TV' ? 'TV' : 'MOVIE';
    const payload = await titleService.getTitlePage(
      Number(paramString(req, 'tmdbId')),
      mediaType,
      (req as AuthedRequest).userId,
    );

    res.json(payload);
  } catch (error) {
    next(error);
  }
};
