const FALLBACK = '/discover';

export function safeNext(raw: string | null | undefined, fallback = FALLBACK) {
  if (
    !raw ||
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    raw.startsWith('/login') ||
    raw.startsWith('/signup') ||
    raw.startsWith('/auth')
  ) {
    return fallback;
  }

  return raw;
}

export function withNext(to: string, next: string) {
  const q = new URLSearchParams({ next: safeNext(next) });

  return `${to}?${q.toString()}`;
}
