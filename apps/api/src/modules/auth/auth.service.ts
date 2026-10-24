import { randomBytes } from 'node:crypto';

import bcrypt from 'bcryptjs';

import { env } from '#config/env.js';
import {
  AppError,
  UnauthorizedError,
  ValidationError,
} from '#errors/app-error.js';
import { toPublicUser } from '#utils/to-public-user.js';

import {
  DEMO_EMAIL,
  DEMO_USERNAME,
  RESERVED_USERNAMES,
  USERNAME_RE,
} from './auth.constants.js';
import * as authRepository from './auth.repository.js';
import type { LoginInput, SignupInput } from './auth.schema.js';

export async function signup(input: SignupInput) {
  if (!USERNAME_RE.test(input.username)) {
    throw new ValidationError('Username: 3–20 letters, numbers, underscore');
  }

  if (RESERVED_USERNAMES.has(input.username)) {
    throw new AppError({ code: 'USERNAME_RESERVED' });
  }

  const taken = await authRepository.findUserByEmailOrUsername(
    input.email,
    input.username,
  );

  if (taken?.email === input.email) {
    throw new AppError({ code: 'EMAIL_TAKEN' });
  }

  if (taken?.username === input.username) {
    throw new AppError({ code: 'USERNAME_TAKEN' });
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const autoVerify = env.isDev;
  const user = await authRepository.createUser({
    name: input.name,
    email: input.email,
    username: input.username,
    passwordHash,
    emailVerified: autoVerify ? new Date() : null,
  });

  if (!autoVerify) {
    await authRepository.createVerificationToken(input.email);

    return {
      autoVerified: false,
      accessToken: null,
      user: toPublicUser(user),
    };
  }

  const sessionToken = await authRepository.createSession(user.id);

  return {
    autoVerified: true,
    accessToken: sessionToken,
    user: toPublicUser(user),
  };
}

export async function login(input: LoginInput) {
  const user = await authRepository.findUserByEmail(input.email);

  if (!user?.passwordHash) {
    throw new AppError({ code: 'INVALID_CREDENTIALS' });
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);

  if (!ok) {
    throw new AppError({ code: 'INVALID_CREDENTIALS' });
  }

  if (!user.emailVerified) {
    throw new AppError({ code: 'UNVERIFIED' });
  }

  if (!user.username) {
    throw new AppError({ code: 'USERNAME_REQUIRED' });
  }

  const token = await authRepository.createSession(user.id);

  return { accessToken: token, user: toPublicUser(user) };
}

export async function ensureDemoUser() {
  const existing = await authRepository.findUserByEmail(DEMO_EMAIL);

  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(randomBytes(24).toString('hex'), 12);

  return authRepository.createUser({
    name: 'Demo',
    email: DEMO_EMAIL,
    username: DEMO_USERNAME,
    passwordHash,
    emailVerified: new Date(),
  });
}

export async function loginDemo() {
  const user = await ensureDemoUser();
  const token = await authRepository.createSession(user.id);

  return { accessToken: token, user: toPublicUser(user) };
}

export async function logout(token: string | undefined) {
  if (token) {
    await authRepository.deleteSessionsByToken(token);
  }
}

export async function currentUser(userId: string) {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new UnauthorizedError('Gone');
  }

  return toPublicUser(user);
}

export async function verifyEmail(token: string) {
  const row = await authRepository.findVerificationToken(token);

  if (!row) {
    throw new AppError({ code: 'INVALID_TOKEN' });
  }

  if (row.expires < new Date()) {
    throw new AppError({ code: 'EXPIRED_TOKEN' });
  }

  await authRepository.markEmailVerified(row.identifier);
  await authRepository.deleteVerificationToken(token);
}
