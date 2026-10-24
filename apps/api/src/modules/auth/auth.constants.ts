export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export const RESERVED_USERNAMES = new Set([
  'login',
  'signup',
  'logout',
  'settings',
  'home',
  'discover',
  'titles',
  'reviews',
  'lists',
  'collections',
  'friends',
  'users',
  'api',
  'onboarding',
  'verify-email',
  'auth',
  'admin',
  'www',
  'search',
  'activity',
]);
