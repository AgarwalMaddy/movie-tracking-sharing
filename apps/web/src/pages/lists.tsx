import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { api, peek } from '@/lib/api';

export function ListsPage() {
  const { user } = useAuth();
  const listPath = user?.username ? `/users/${user.username}/lists` : '';
  const [lists, setLists] = useState<
    {
      name: string;
      slug: string;
      itemCount: number;
      posters: (string | null)[];
    }[]
  >(() =>
    listPath
      ? (peek<{
          lists: {
            name: string;
            slug: string;
            itemCount: number;
            posters: (string | null)[];
          }[];
        }>(listPath)?.lists ?? [])
      : [],
  );
  const load = () => {
    if (!user?.username) {
      return;
    }
    void api<{ lists: typeof lists }>(`/users/${user.username}/lists`).then(
      (d) => setLists(d.lists),
    );
  };

  useEffect(() => {
    load();
  }, [user?.username]);
  const presets = ['Favorites', 'Rewatch', 'Comfort', 'With friends'];

  async function createNamed(name: string) {
    await api('/lists', { method: 'POST', body: JSON.stringify({ name }) });
    load();
  }

  return (
    <main className="page">
      <div className="hero-block">
        <h1>Lists</h1>
      </div>
      <div className="chips">
        {presets.map((n) => (
          <button key={n} className="chip" onClick={() => createNamed(n)}>
            + {n}
          </button>
        ))}
      </div>
      {lists.map((l) => (
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
    </main>
  );
}
