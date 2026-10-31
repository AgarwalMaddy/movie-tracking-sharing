import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { api, peek } from '@/lib/api';
import { withNext } from '@/lib/next-path';

type ListCard = {
  name: string;
  slug: string;
  itemCount: number;
  posters: (string | null)[];
  user?: { username: string | null };
};

export function ListsPage() {
  const { user } = useAuth();
  const minePath = user?.username ? `/users/${user.username}/lists` : '';
  const [mine, setMine] = useState<ListCard[]>(() =>
    minePath ? (peek<{ lists: ListCard[] }>(minePath)?.lists ?? []) : [],
  );
  const [community, setCommunity] = useState<ListCard[]>(
    () => peek<{ lists: ListCard[] }>('/lists')?.lists ?? [],
  );
  const presets = ['Favorites', 'Rewatch', 'Comfort', 'With friends'];
  const others = community.filter(
    (l) => l.user?.username && l.user.username !== user?.username,
  );

  const loadMine = () => {
    if (!minePath) {
      return;
    }

    void api<{ lists: ListCard[] }>(minePath).then((d) => setMine(d.lists));
  };

  useEffect(() => {
    loadMine();
  }, [minePath]);

  useEffect(() => {
    void api<{ lists: ListCard[] }>('/lists').then((d) =>
      setCommunity(d.lists),
    );
  }, []);

  async function createNamed(name: string) {
    await api('/lists', { method: 'POST', body: JSON.stringify({ name }) });
    loadMine();
  }

  return (
    <main className="page">
      <div className="hero-block">
        <h1>Lists</h1>
      </div>
      {user ? (
        <div className="chips">
          {presets.map((n) => (
            <button key={n} className="chip" onClick={() => createNamed(n)}>
              + {n}
            </button>
          ))}
        </div>
      ) : (
        <p className="lede" style={{ padding: '0 var(--gutter)' }}>
          Public lists from the community.{' '}
          <Link to={withNext('/login', '/lists')}>Sign in</Link> to start your
          own.
        </p>
      )}
      {mine.map((l) => (
        <Link
          key={l.slug}
          className="list-tile"
          to={`/u/${user?.username}/list/${l.slug}`}
        >
          <div className="thumbs">
            {l.posters
              .filter((p): p is string => Boolean(p))
              .map((p) => (
                <img key={p} src={p} alt="" />
              ))}
          </div>
          <div>
            <strong>{l.name}</strong>
            <p className="muted">{l.itemCount} titles</p>
          </div>
        </Link>
      ))}
      {others.length ? (
        <>
          {user ? <h2 className="page-inner">From the community</h2> : null}
          {others.map((l) => (
            <Link
              key={`${l.user?.username ?? ''}-${l.slug}`}
              className="list-tile"
              to={`/u/${l.user?.username}/list/${l.slug}`}
            >
              <div className="thumbs">
                {l.posters
                  .filter((p): p is string => Boolean(p))
                  .map((p) => (
                    <img key={p} src={p} alt="" />
                  ))}
              </div>
              <div>
                <strong>{l.name}</strong>
                <p className="muted">
                  @{l.user?.username} · {l.itemCount} titles
                </p>
              </div>
            </Link>
          ))}
        </>
      ) : null}
      {!mine.length && !others.length ? (
        <p className="muted page-inner">No lists yet.</p>
      ) : null}
    </main>
  );
}
