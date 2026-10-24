import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PosterGrid } from '@/features/titles';
import { api, type Title } from '@/lib/api';

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const [results, setResults] = useState<Title[]>([]);

  useEffect(() => {
    if (q.length < 2) {
      return;
    }
    void api<{ results: Title[] }>(
      `/titles/search?q=${encodeURIComponent(q)}`,
    ).then((d) => setResults(d.results));
  }, [q]);

  return (
    <main className="page">
      <div className="hero-block">
        <h1>Search</h1>
        <p className="lede">{q || 'Open search from the header.'}</p>
      </div>
      <PosterGrid titles={results} />
    </main>
  );
}
