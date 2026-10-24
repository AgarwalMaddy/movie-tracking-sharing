import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api, peek, type User } from '@/lib/api';

export function Activity() {
  const [events, setEvents] = useState<
    { id: string; type: string; payload: Record<string, string>; actor: User }[]
  >(
    () =>
      peek<{
        events: {
          id: string;
          type: string;
          payload: Record<string, string>;
          actor: User;
        }[];
      }>('/activity')?.events ?? [],
  );

  useEffect(() => {
    void api<{ events: typeof events }>('/activity').then((d) =>
      setEvents(d.events),
    );
  }, []);

  return (
    <main className="page">
      <h1>Activity</h1>
      <div className="feed">
        {events.map((e) => (
          <article key={e.id}>
            <Link to={`/u/${e.actor.username}`}>@{e.actor.username}</Link>{' '}
            {e.type.toLowerCase()} {e.payload.title ?? e.payload.name ?? ''}
          </article>
        ))}
      </div>
    </main>
  );
}
