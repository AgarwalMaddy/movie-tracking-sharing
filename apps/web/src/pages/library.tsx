import { useEffect, useState } from 'react';

import { PosterGrid } from '@/features/titles';
import { api, peek, type Title } from '@/lib/api';

export function Library() {
  const [tab, setTab] = useState('WATCHED');
  const [entries, setEntries] = useState<{ status: string; title: Title }[]>(
    () =>
      peek<{ entries: { status: string; title: Title }[] }>(
        `/me/library?status=WATCHED`,
      )?.entries ?? [],
  );

  useEffect(() => {
    void api<{ entries: { status: string; title: Title }[] }>(
      `/me/library?status=${tab}`,
    ).then((d) => setEntries(d.entries));
  }, [tab]);

  return (
    <main className="page">
      <div className="hero-block">
        <h1>Library</h1>
      </div>
      <div className="chips">
        {['WATCHED', 'WATCHING', 'WANT'].map((s) => (
          <button
            key={s}
            className="chip"
            aria-pressed={tab === s}
            onClick={() => setTab(s)}
          >
            {s === 'WATCHED'
              ? 'Watched'
              : s === 'WATCHING'
                ? 'Watching'
                : 'Want'}
          </button>
        ))}
      </div>
      <PosterGrid titles={entries.map((e) => e.title)} />
    </main>
  );
}
