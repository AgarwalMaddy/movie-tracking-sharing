import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PosterGrid } from '@/features/titles';
import { api, type Title } from '@/lib/api';
import { errMessage } from '@/lib/err-message';

export function SearchPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const q = params.get('q') ?? '';
  const [draft, setDraft] = useState(q);
  const [seenQ, setSeenQ] = useState(q);
  const [results, setResults] = useState<Title[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(q.length >= 2);

  if (seenQ !== q) {
    setSeenQ(q);
    setDraft(q);
    if (q.length < 2) {
      setResults([]);
    }
  }

  useEffect(() => {
    if (q.length < 2) {
      setLoading(false);

      return;
    }

    setLoading(true);
    void api<{ results: Title[] }>(`/titles/search?q=${encodeURIComponent(q)}`)
      .then((d) => {
        setResults(d.results);
        setErr('');
      })
      .catch((e: unknown) => setErr(errMessage(e)))
      .finally(() => setLoading(false));
  }, [q]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = draft.trim();

    if (query.length < 2) {
      return;
    }

    void nav(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <main className="page">
      <div className="hero-block">
        <h1>Search</h1>
        <form onSubmit={onSubmit}>
          <label className="field">
            Titles
            <input
              className="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Movie or series"
              autoComplete="off"
            />
          </label>
        </form>
      </div>
      {err ? <p className="error">{err}</p> : null}
      {loading ? <p className="muted page-inner">Searching…</p> : null}
      {q.length >= 2 && !err && !loading && !results.length ? (
        <p className="muted page-inner">No titles for {q}.</p>
      ) : null}
      <PosterGrid titles={results} />
    </main>
  );
}
