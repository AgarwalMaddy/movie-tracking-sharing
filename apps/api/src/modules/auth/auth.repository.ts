import { randomBytes } from 'node:crypto';

import { db } from '#config/db.js';
import { SESSION_TTL_MS } from '#constants/session.js';

export async function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function findUserByEmailOrUsername(
  email: string,
  username: string,
) {
  return db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  emailVerified: Date | null;
}) {
  return db.user.create({ data });
}

export async function createSession(userId: string) {
  const sessionToken = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({ data: { sessionToken, userId, expires } });

  return sessionToken;
}

export async function deleteSessionsByToken(token: string) {
  await db.session.deleteMany({ where: { sessionToken: token } });
}

export async function createVerificationToken(email: string) {
  const token = randomBytes(32).toString('hex');

  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 86400000),
    },
  });

  return token;
}

export async function findVerificationToken(token: string) {
  return db.verificationToken.findUnique({ where: { token } });
}

export async function markEmailVerified(email: string) {
  await db.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
}

export async function deleteVerificationToken(token: string) {
  await db.verificationToken.delete({ where: { token } });
}
