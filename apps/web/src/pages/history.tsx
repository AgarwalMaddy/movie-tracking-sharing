import { useEffect, useState } from 'react';

import { api, type Title } from '@/lib/api';

export function HistoryPage() {
  const [logs, setLogs] = useState<
    { id: string; watchedAt: string; title: Title }[]
  >([]);

  useEffect(() => {
    void api<{ logs: typeof logs }>('/me/history').then((d) => setLogs(d.logs));
  }, []);

  return (
    <main className="page">
      <h1>Watch log</h1>
      {logs.map((l) => (
        <p key={l.id}>
          {new Date(l.watchedAt).toLocaleDateString()} — {l.title.title}
        </p>
      ))}
    </main>
  );
}
