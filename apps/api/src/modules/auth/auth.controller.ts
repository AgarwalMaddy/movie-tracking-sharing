import { randomBytes } from 'node:crypto';

import type { RequestHandler, Response } from 'express';

import { env } from '#config/env.js';
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from '#constants/session.js';
import { AppError, ValidationError } from '#errors/app-error.js';
import {
  authedUserId,
  cookieValue,
  queryString,
  type AuthedRequest,
} from '#middlewares/auth.js';

import { OAUTH_STATE_COOKIE } from './auth.constants.js';
import {
  fetchGoogleProfile,
  googleAuthUrl,
  googleEnabled,
  loginWithGoogle,
} from './auth.google.js';
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

function safePath(raw: string) {
  if (
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    raw.startsWith('/login') ||
    raw.startsWith('/signup') ||
    raw.startsWith('/auth')
  ) {
    return '/discover';
  }

  return raw;
}

function webLoginError() {
  return `${env.WEB_ORIGIN}/login?error=google`;
}

export const providers: RequestHandler = (_req, res) => {
  res.json({ google: googleEnabled(), demo: true });
};

export const demo: RequestHandler = async (_req, res, next) => {
  try {
    const result = await authService.loginDemo();

    setSessionCookie(res, result.accessToken);
    res.json({ ok: true, accessToken: result.accessToken, user: result.user });
  } catch (error) {
    next(error);
  }
};

export const googleStart: RequestHandler = (req, res) => {
  if (!googleEnabled()) {
    res.redirect(webLoginError());

    return;
  }

  const state = randomBytes(16).toString('hex');
  const next = safePath(queryString(req, 'next', '/discover'));

  res.cookie(OAUTH_STATE_COOKIE, `${state}.${encodeURIComponent(next)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !env.isDev,
    maxAge: 10 * 60 * 1000,
    path: '/',
  });
  res.redirect(googleAuthUrl(state));
};

export const googleCallback: RequestHandler = async (req, res) => {
  try {
    if (!googleEnabled() || queryString(req, 'error')) {
      res.redirect(webLoginError());

      return;
    }

    const packed = cookieValue(req, OAUTH_STATE_COOKIE) ?? '';
    const sep = packed.indexOf('.');
    const expected = sep === -1 ? packed : packed.slice(0, sep);
    const next = safePath(
      sep === -1 ? '/discover' : decodeURIComponent(packed.slice(sep + 1)),
    );
    const state = queryString(req, 'state');
    const code = queryString(req, 'code');

    res.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

    if (!code || !expected || state !== expected) {
      throw new AppError({
        code: 'INVALID_TOKEN',
        message: 'Google sign-in failed',
      });
    }

    const profile = await fetchGoogleProfile(code);
    const result = await loginWithGoogle(profile);

    setSessionCookie(res, result.accessToken);
    const done = new URL('/auth/callback', env.WEB_ORIGIN);

    done.searchParams.set('accessToken', result.accessToken);
    done.searchParams.set('next', next);
    res.redirect(done.toString());
  } catch {
    res.redirect(webLoginError());
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
