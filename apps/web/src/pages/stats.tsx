import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

export function StatsPage() {
  const [s, setS] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    void api<Record<string, number>>('/me/stats').then(setS);
  }, []);

  if (!s) {
    return <main className="page">Loading…</main>;
  }

  return (
    <main className="page">
      <h1>Stats</h1>
      <div className="stat-row">
        {Object.entries(s)
          .filter(([, v]) => typeof v === 'number')
          .map(([k, v]) => (
            <div className="stat" key={k}>
              <b>{v}</b> {k}
            </div>
          ))}
      </div>
    </main>
  );
}
