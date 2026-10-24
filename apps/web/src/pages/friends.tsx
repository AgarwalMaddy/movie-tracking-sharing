import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api, type User } from '@/lib/api';

export function Friends() {
  const [q, setQ] = useState('');
  const [found, setFound] = useState<User[]>([]);
  const [pack, setPack] = useState<{
    friends: User[];
    incoming: { id: string; user: User }[];
  }>({
    friends: [],
    incoming: [],
  });
  const load = () => api<typeof pack>('/friends').then(setPack);

  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (q.length < 2) {
      return;
    }
    void api<{ users: User[] }>(
      `/users/search?q=${encodeURIComponent(q)}`,
    ).then((d) => setFound(d.users));
  }, [q]);

  return (
    <main className="page">
      <h1>Friends</h1>
      <input
        className="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Find username"
      />
      {found.map((u) => (
        <div key={u.id} className="list-card">
          <Link to={`/u/${u.username}`}>@{u.username}</Link>
          <button
            className="btn ghost"
            onClick={() =>
              api('/friends/request', {
                method: 'POST',
                body: JSON.stringify({ username: u.username }),
              })
            }
          >
            Request
          </button>
        </div>
      ))}
      <h2>Incoming</h2>
      {pack.incoming.map((r) => (
        <div key={r.id} className="row">
          <Link to={`/u/${r.user.username}`}>@{r.user.username}</Link>
          <button
            className="btn"
            onClick={async () => {
              await api('/friends/respond', {
                method: 'POST',
                body: JSON.stringify({ requestId: r.id, accept: true }),
              });
              await load();
            }}
          >
            Accept
          </button>
        </div>
      ))}
      <h2>Your people</h2>
      {pack.friends.map((f) => (
        <p key={f.id}>
          <Link to={`/u/${f.username}`}>@{f.username}</Link>
        </p>
      ))}
    </main>
  );
}
