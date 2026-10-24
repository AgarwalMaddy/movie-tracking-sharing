import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { PosterGrid } from '@/features/titles';
import { api, type Title, type User } from '@/lib/api';

export function Profile() {
  const { username = '' } = useParams();
  const { user, logout } = useAuth();
  const [data, setData] = useState<null | {
    user: User;
    stats: { titles: number; lists: number; reviews: number; hours: number };
    recently: { title: Title }[];
    lists: { name: string; slug: string; itemCount: number }[];
  }>(null);

  useEffect(() => {
    void api<NonNullable<typeof data>>(`/users/${username}`).then(setData);
  }, [username]);

  if (!data) {
    return <main className="page">Loading…</main>;
  }

  const mine = user?.username === username;

  return (
    <main className="page">
      <h1>{data.user.name}</h1>
      <p className="muted">@{data.user.username}</p>
      <p>{data.user.bio}</p>
      <div className="stat-row">
        <div className="stat">
          <b>{data.stats.titles}</b> watched
        </div>
        <div className="stat">
          <b>{data.stats.lists}</b> lists
        </div>
        <div className="stat">
          <b>{data.stats.reviews}</b> reviews
        </div>
        <div className="stat">
          <b>{data.stats.hours}</b> hrs
        </div>
      </div>
      {mine ? (
        <div className="row">
          <Link className="btn ghost" to="/stats">
            Stats
          </Link>
          <button className="btn ghost" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      ) : (
        <button
          className="btn"
          onClick={() =>
            api('/friends/request', {
              method: 'POST',
              body: JSON.stringify({ username }),
            })
          }
        >
          Add friend
        </button>
      )}
      <h2>Recently</h2>
      <PosterGrid titles={data.recently.map((r) => r.title)} />
      <h2>Lists</h2>
      {data.lists.map((l) => (
        <p key={l.slug}>
          <Link to={`/u/${username}/list/${l.slug}`}>
            {l.name} ({l.itemCount})
          </Link>
        </p>
      ))}
    </main>
  );
}
