import { randomBytes } from 'node:crypto';

import { env } from '#config/env.js';
import { AppError } from '#errors/app-error.js';
import { toPublicUser } from '#utils/to-public-user.js';

import { RESERVED_USERNAMES, USERNAME_RE } from './auth.constants.js';
import * as authRepository from './auth.repository.js';

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO = 'https://www.googleapis.com/oauth2/v3/userinfo';

export function googleEnabled() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri() {
  return `${env.WEB_ORIGIN.replace(/\/$/, '')}/api/auth/google/callback`;
}

export function googleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  return `${GOOGLE_AUTH}?${params.toString()}`;
}

type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

export async function fetchGoogleProfile(code: string): Promise<GoogleProfile> {
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: googleRedirectUri(),
    grant_type: 'authorization_code',
  });
  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
  };

  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new AppError({
      code: 'INVALID_TOKEN',
      message: 'Google sign-in failed',
    });
  }

  const profileRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const profile = (await profileRes.json()) as Partial<GoogleProfile>;

  if (!profileRes.ok || !profile.sub || !profile.email) {
    throw new AppError({
      code: 'INVALID_TOKEN',
      message: 'Google sign-in failed',
    });
  }

  return {
    sub: profile.sub,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  };
}

function baseUsername(email: string, name?: string) {
  const fromName = (name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 16);
  const fromEmail = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 16);

  if (fromName.length >= 3) {
    return fromName;
  }

  if (fromEmail.length >= 3) {
    return fromEmail;
  }

  return 'user';
}

async function uniqueUsername(email: string, name?: string) {
  const base = baseUsername(email, name);
  let candidate = base;

  for (let i = 0; i < 8; i += 1) {
    if (USERNAME_RE.test(candidate) && !RESERVED_USERNAMES.has(candidate)) {
      const clash = await authRepository.findUserByUsername(candidate);

      if (!clash) {
        return candidate;
      }
    }

    candidate = `${base.slice(0, 16)}${randomBytes(2).toString('hex')}`.slice(
      0,
      20,
    );
  }

  return `u${randomBytes(4).toString('hex')}`.slice(0, 20);
}

export async function loginWithGoogle(profile: GoogleProfile) {
  const existing = await authRepository.findAccount('google', profile.sub);

  if (existing?.user) {
    const token = await authRepository.createSession(existing.user.id);

    return { accessToken: token, user: toPublicUser(existing.user) };
  }

  const byEmail = await authRepository.findUserByEmail(profile.email);
  const user =
    byEmail ??
    (await authRepository.createUser({
      name: profile.name ?? (profile.email.split('@')[0] || 'Google user'),
      email: profile.email,
      username: await uniqueUsername(profile.email, profile.name),
      passwordHash: null,
      emailVerified: new Date(),
      image: profile.picture ?? null,
    }));

  await authRepository.linkAccount(user.id, 'google', profile.sub);
  const token = await authRepository.createSession(user.id);

  return { accessToken: token, user: toPublicUser(user) };
}
