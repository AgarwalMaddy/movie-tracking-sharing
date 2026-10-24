type Entry<T> = { at: number; data: T };

const store = new Map<string, Entry<unknown>>();

export async function memo<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;

  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.data;
  }

  const data = await fn();

  store.set(key, { at: Date.now(), data });

  return data;
}

export function forget(key: string) {
  store.delete(key);
}
