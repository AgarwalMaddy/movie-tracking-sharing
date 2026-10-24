import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { db } from '#config/db.js';
import { SESSION_COOKIE_NAME } from '#constants/session.js';
import { UnauthorizedError } from '#errors/app-error.js';
import { asString } from '#utils/as-string.js';

export type AuthedRequest = Request & { userId?: string };

function cookieValue(req: Request, name: string): string | undefined {
  const cookies: unknown = req.cookies;

  if (typeof cookies !== 'object' || cookies === null) {
    return undefined;
  }

  const value = (cookies as Record<string, unknown>)[name];

  return typeof value === 'string' ? value : undefined;
}

function readToken(req: Request) {
  const cookie = cookieValue(req, SESSION_COOKIE_NAME);
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  return cookie || bearer;
}

export function authedUserId(req: AuthedRequest): string {
  if (!req.userId) {
    throw new UnauthorizedError();
  }

  return req.userId;
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = readToken(req);

    if (!token) {
      next();

      return;
    }

    const session = await db.session.findUnique({
      where: { sessionToken: token },
    });

    if (session && session.expires > new Date()) {
      (req as AuthedRequest).userId = session.userId;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    await optionalAuth(req, res, () => undefined);

    if (!(req as AuthedRequest).userId) {
      next(new UnauthorizedError());

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export function paramString(req: Request, name: string): string {
  return asString(req.params[name]);
}

export function queryString(req: Request, name: string, fallback = ''): string {
  return asString(req.query[name], fallback);
}

export { cookieValue, readToken };

export type { NextFunction, Response };
