const TOKEN_KEY = 'mts_token';
const TTL = 1000 * 60 * 5;
const SS = 'mts-cache:';
const cache = new Map<string, { at: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

const USER_RE =
  /^\/(me|library|lists|reviews|friends|inbox|activity|auth|notifications)\b/;

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function persist(key: string, entry: { at: number; data: unknown }) {
  cache.set(key, entry);

  try {
    sessionStorage.setItem(SS + key, JSON.stringify(entry));
  } catch {
    /* quota */
  }
}

function read(key: string) {
  const mem = cache.get(key);

  if (mem && Date.now() - mem.at < TTL) {
    return mem;
  }

  try {
    const raw = sessionStorage.getItem(SS + key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { at: number; data: unknown };

    if (Date.now() - parsed.at >= TTL) {
      sessionStorage.removeItem(SS + key);

      return null;
    }

    cache.set(key, parsed);

    return parsed;
  } catch {
    return null;
  }
}

export function bustCache() {
  cache.clear();

  try {
    const keys = Object.keys(sessionStorage).filter((k) => k.startsWith(SS));

    for (const k of keys) {
      sessionStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}

export function bustUserCache() {
  for (const key of [...cache.keys()]) {
    const path = key.replace(/^[A-Z]+:/, '');

    if (USER_RE.test(path)) {
      cache.delete(key);

      try {
        sessionStorage.removeItem(SS + key);
      } catch {
        /* ignore */
      }
    }
  }
}

export function peek<T>(path: string): T | null {
  const hit = read(`GET:${path}`);

  return hit ? (hit.data as T) : null;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const key = `${method}:${path}`;

  async function send() {
    const headers = new Headers(init.headers);

    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const token = getToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`/api${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    } & T;

    if (!res.ok) {
      throw new ApiError(
        data.error ?? 'Request failed',
        data.code ?? 'ERROR',
        res.status,
      );
    }

    if (method === 'GET') {
      persist(key, { at: Date.now(), data });
    } else {
      bustUserCache();
    }

    return data;
  }

  if (method === 'GET') {
    const hit = read(key);

    if (hit) {
      return hit.data as T;
    }

    const existing = inflight.get(key);

    if (existing) {
      return existing as Promise<T>;
    }

    const run = send().finally(() => {
      if (inflight.get(key) === run) {
        inflight.delete(key);
      }
    });

    inflight.set(key, run);

    return run;
  }

  return send();
}

export function prefetch(path: string) {
  void api(path).catch(() => undefined);
}

export type User = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  bio?: string | null;
};

export type Title = {
  id?: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  posterUrl: string | null;
  backdropUrl?: string | null;
  imdbUrl?: string | null;
  rtUrl?: string | null;
  releaseDate: string | null;
  overview?: string | null;
};

export type Rail = { id: string; label: string; kind: string; titles: Title[] };
export type WatchOffer = { name: string; logoUrl: string | null; type: string };
export type Genre = { id: number; name: string };
export type Language = { code: string; name: string };
export type Person = { id: number; name: string; image: string | null };
