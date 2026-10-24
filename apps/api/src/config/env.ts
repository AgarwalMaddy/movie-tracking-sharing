import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
const roots = [
  resolve(here, '../../../..'),
  resolve(here, '../../..'),
  process.cwd(),
  resolve(process.cwd(), '../..'),
];

for (const root of roots) {
  for (const name of ['.env.local', '.env']) {
    const p = resolve(root, name);

    if (existsSync(p)) {
      config({ path: p, override: false });
    }
  }
}

function req(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;

  if (!v) {
    throw new Error(`Missing env ${name}`);
  }

  return v;
}

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isDev = NODE_ENV !== 'production';
const DEV_SESSION_SECRET = 'dev-only-change-me-32-chars-min!!';
const SESSION_SECRET =
  process.env.SESSION_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  DEV_SESSION_SECRET;

if (!isDev && SESSION_SECRET === DEV_SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required in production');
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: req('DATABASE_URL'),
  SESSION_SECRET,
  WEB_ORIGIN: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  API_URL: process.env.API_URL ?? 'http://localhost:4000',
  TMDB_API_KEY: process.env.TMDB_API_KEY ?? '',
  TMDB_DNS_SERVERS: process.env.TMDB_DNS_SERVERS ?? '1.1.1.1,8.8.8.8,1.0.0.1',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  NODE_ENV,
  get isDev() {
    return this.NODE_ENV !== 'production';
  },
};
