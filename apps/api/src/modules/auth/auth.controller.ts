import type { RequestHandler, Response } from 'express';

import { env } from '#config/env.js';
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from '#constants/session.js';
import { ValidationError } from '#errors/app-error.js';
import {
  authedUserId,
  cookieValue,
  queryString,
  type AuthedRequest,
} from '#middlewares/auth.js';

import { loginSchema, signupSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !env.isDev,
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const input = signupSchema.parse(req.body);
    const result = await authService.signup(input);

    if (result.accessToken) {
      setSessionCookie(res, result.accessToken);
    }

    res.json({
      ok: true,
      autoVerified: result.autoVerified,
      accessToken: result.accessToken ?? undefined,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ValidationError('Invalid email or password');
    }

    const result = await authService.login(parsed.data);

    setSessionCookie(res, result.accessToken);
    res.json({ ok: true, accessToken: result.accessToken, user: result.user });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    await authService.logout(cookieValue(req, SESSION_COOKIE_NAME));
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.currentUser(
      authedUserId(req as AuthedRequest),
    );

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail: RequestHandler = async (req, res, next) => {
  try {
    await authService.verifyEmail(queryString(req, 'token'));
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
