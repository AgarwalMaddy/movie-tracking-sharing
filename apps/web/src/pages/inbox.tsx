import { useEffect, useState } from 'react';

import { api, type Title, type User } from '@/lib/api';

export function Inbox() {
  const [items, setItems] = useState<
    { id: string; message: string; sender: User; title: Title }[]
  >([]);
  const load = () =>
    api<{ items: typeof items }>('/inbox').then((d) => setItems(d.items));

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="page">
      <h1>Inbox</h1>
      {items.map((i) => (
        <div key={i.id} className="card" style={{ marginBottom: 12 }}>
          <p>
            {i.sender.username} on {i.title.title}
          </p>
          <p>{i.message}</p>
          <button
            className="btn"
            onClick={async () => {
              await api(`/inbox/${i.id}/accept`, { method: 'POST' });
              await load();
            }}
          >
            Add to Want
          </button>
        </div>
      ))}
    </main>
  );
}
