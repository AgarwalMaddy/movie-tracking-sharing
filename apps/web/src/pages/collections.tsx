import { useEffect, useState } from 'react';

import { Rail as PosterRail } from '@/features/titles';
import { api, peek, type Title } from '@/lib/api';

export function CollectionsPage() {
  const [cols, setCols] = useState<
    { slug: string; name: string; description: string; titles: Title[] }[]
  >(
    () =>
      peek<{
        collections: {
          slug: string;
          name: string;
          description: string;
          titles: Title[];
        }[];
      }>('/collections')?.collections ?? [],
  );

  useEffect(() => {
    void api<{ collections: typeof cols }>('/collections').then((d) =>
      setCols(d.collections),
    );
  }, []);

  return (
    <main className="page">
      <div className="hero-block">
        <h1>Collections</h1>
      </div>
      {cols.map((c) => (
        <PosterRail key={c.slug} label={c.name} titles={c.titles} />
      ))}
    </main>
  );
}
