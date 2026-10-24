import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import {
  listHref,
  personHref,
  readSearchTab,
  SEARCH_TABS,
  type PublicList,
  type SearchTab,
} from '@/features/search';
import { PosterGrid } from '@/features/titles';
import { api, type Person, type Title, type User } from '@/lib/api';
import { errMessage } from '@/lib/err-message';

export function SearchPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const q = params.get('q') ?? '';
  const tab = readSearchTab(params.get('tab'));
  const [draft, setDraft] = useState(q);
  const [seenQ, setSeenQ] = useState(q);

  if (seenQ !== q) {
    setSeenQ(q);
    setDraft(q);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = draft.trim();

    if (query.length < 2) {
      return;
    }

    const next = new URLSearchParams({ q: query, tab });

    void nav(`/search?${next.toString()}`);
  }

  return (
    <main className="page">
      <div className="hero-block">
        <h1>Search</h1>
        <form onSubmit={onSubmit}>
          <label className="field">
            Search
            <input
              className="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Movie, person, list, or user"
              autoComplete="off"
            />
          </label>
        </form>
      </div>
      <nav className="chips" aria-label="Search in">
        {SEARCH_TABS.map((item) => (
          <Link
            key={item}
            className={tab === item ? 'chip on' : 'chip'}
            to={searchHref(q, item)}
            viewTransition
          >
            {labelFor(item)}
          </Link>
        ))}
      </nav>
      {tab === 'titles' ? <TitleHits q={q} /> : null}
      {tab === 'people' ? <PeopleHits q={q} /> : null}
      {tab === 'lists' ? <ListHits q={q} /> : null}
      {tab === 'users' ? <UserHits q={q} /> : null}
    </main>
  );
}

function searchHref(q: string, tab: SearchTab) {
  const next = new URLSearchParams({ tab });

  if (q) {
    next.set('q', q);
  }

  return `/search?${next.toString()}`;
}

function labelFor(tab: SearchTab) {
  if (tab === 'titles') {
    return 'Titles';
  }

  if (tab === 'people') {
    return 'People';
  }

  if (tab === 'lists') {
    return 'Lists';
  }

  return 'Users';
}

function TitleHits({ q }: { q: string }) {
  const [results, setResults] = useState<Title[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(q.length >= 2);

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setErr('');

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

  return (
    <HitsFrame
      err={err}
      loading={loading}
      empty={q.length >= 2 && !results.length ? `No titles for ${q}.` : ''}
    >
      <PosterGrid titles={results} />
    </HitsFrame>
  );
}

function PeopleHits({ q }: { q: string }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(q.length >= 2);

  useEffect(() => {
    if (q.length < 2) {
      setPeople([]);
      setLoading(false);
      setErr('');

      return;
    }

    setLoading(true);
    void api<{ people: Person[] }>(
      `/discover/people?role=cast&q=${encodeURIComponent(q)}`,
    )
      .then((d) => {
        setPeople(d.people);
        setErr('');
      })
      .catch((e: unknown) => setErr(errMessage(e)))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <HitsFrame
      err={err}
      loading={loading}
      empty={q.length >= 2 && !people.length ? `No people for ${q}.` : ''}
    >
      <ul className="result-list">
        {people.map((p) => (
          <li key={p.id}>
            <Link className="list-tile" to={personHref(p)} viewTransition>
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </HitsFrame>
  );
}

function ListHits({ q }: { q: string }) {
  const [lists, setLists] = useState<PublicList[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(q.length >= 2);

  useEffect(() => {
    if (q.length < 2) {
      setLists([]);
      setLoading(false);
      setErr('');

      return;
    }

    setLoading(true);
    void api<{ lists: PublicList[] }>(`/lists?q=${encodeURIComponent(q)}`)
      .then((d) => {
        setLists(d.lists);
        setErr('');
      })
      .catch((e: unknown) => setErr(errMessage(e)))
      .finally(() => setLoading(false));
  }, [q]);

  const visible = lists.filter((l) => l.user?.username);

  return (
    <HitsFrame
      err={err}
      loading={loading}
      empty={q.length >= 2 && !visible.length ? `No lists for ${q}.` : ''}
    >
      <ul className="result-list">
        {visible.map((l) => (
          <li key={`${l.user?.username}-${l.slug}`}>
            <Link className="list-tile" to={listHref(l)} viewTransition>
              {l.name}
              <span className="muted"> @{l.user?.username}</span>
            </Link>
          </li>
        ))}
      </ul>
    </HitsFrame>
  );
}

function UserHits({ q }: { q: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(q.length >= 2);

  useEffect(() => {
    if (q.length < 2) {
      setUsers([]);
      setLoading(false);
      setErr('');

      return;
    }

    setLoading(true);
    void api<{ users: User[] }>(`/users/search?q=${encodeURIComponent(q)}`)
      .then((d) => {
        setUsers(d.users);
        setErr('');
      })
      .catch((e: unknown) => setErr(errMessage(e)))
      .finally(() => setLoading(false));
  }, [q]);

  const named = users.filter((u) => u.username);

  return (
    <HitsFrame
      err={err}
      loading={loading}
      empty={q.length >= 2 && !named.length ? `No users for ${q}.` : ''}
    >
      <ul className="result-list">
        {named.map((u) => (
          <li key={u.id}>
            <Link className="list-tile" to={`/u/${u.username}`} viewTransition>
              @{u.username}
            </Link>
          </li>
        ))}
      </ul>
    </HitsFrame>
  );
}

function HitsFrame({
  err,
  loading,
  empty,
  children,
}: {
  err: string;
  loading: boolean;
  empty: string;
  children: ReactNode;
}) {
  if (err) {
    return <p className="error">{err}</p>;
  }

  if (loading) {
    return <p className="muted page-inner">Searching…</p>;
  }

  if (empty) {
    return <p className="muted page-inner">{empty}</p>;
  }

  return <>{children}</>;
}
