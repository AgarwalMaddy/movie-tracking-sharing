import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { type Person, type Title, type User } from '@/lib/api';

import {
  EMPTY_HITS,
  fetchPaletteHits,
  listHref,
  personHref,
  type PaletteHits,
  type PublicList,
} from './hits';

export function SearchPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const query = q.trim();
  const hits = usePaletteHits(open, query);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <PaletteDialog
      q={q}
      query={query}
      hits={hits}
      onClose={onClose}
      onChange={setQ}
    />
  );
}

function usePaletteHits(open: boolean, query: string) {
  const [hits, setHits] = useState<PaletteHits>(EMPTY_HITS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || query.length < 2) {
      setHits(EMPTY_HITS);
      setLoading(false);

      return;
    }

    let alive = true;

    setLoading(true);
    const timer = window.setTimeout(() => {
      void fetchPaletteHits(query)
        .then((next) => {
          if (alive) {
            setHits(next);
          }
        })
        .catch(() => {
          if (alive) {
            setHits(EMPTY_HITS);
          }
        })
        .finally(() => {
          if (alive) {
            setLoading(false);
          }
        });
    }, 200);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  return { hits, loading };
}

function PaletteDialog({
  q,
  query,
  hits,
  onClose,
  onChange,
}: {
  q: string;
  query: string;
  hits: { hits: PaletteHits; loading: boolean };
  onClose: () => void;
  onChange: (value: string) => void;
}) {
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const empty =
    !hits.hits.titles.length &&
    !hits.hits.people.length &&
    !hits.hits.lists.length &&
    !hits.hits.users.length;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (query.length < 2) {
      return;
    }

    onClose();
    void nav(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="overlay" role="presentation">
      <button
        type="button"
        className="overlay-dismiss"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <form onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="palette-q">
            Search
          </label>
          <input
            id="palette-q"
            ref={inputRef}
            value={q}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Titles, people, lists, users"
            autoComplete="off"
          />
        </form>
        <div className="palette-hits">
          {query.length < 2 ? (
            <p className="muted">
              Type two letters. Enter opens the full page.
            </p>
          ) : null}
          {hits.loading ? <p className="muted">Searching…</p> : null}
          {!hits.loading && query.length >= 2 && empty ? (
            <p className="muted">Nothing for {query}.</p>
          ) : null}
          <HitGroup
            label="Titles"
            items={hits.hits.titles}
            href={(t: Title) => `/title/${t.mediaType}/${t.tmdbId}`}
            text={(t) => t.title}
            onPick={onClose}
          />
          <HitGroup
            label="People"
            items={hits.hits.people}
            href={(p: Person) => personHref(p)}
            text={(p) => p.name}
            onPick={onClose}
          />
          <HitGroup
            label="Lists"
            items={hits.hits.lists.filter((l) => l.user?.username)}
            href={(l: PublicList) => listHref(l)}
            text={(l) => l.name}
            onPick={onClose}
          />
          <HitGroup
            label="Users"
            items={hits.hits.users.filter((u) => u.username)}
            href={(u: User) => `/u/${u.username}`}
            text={(u) => `@${u.username}`}
            onPick={onClose}
          />
        </div>
      </div>
    </div>
  );
}

function HitGroup<T>({
  label,
  items,
  href,
  text,
  onPick,
}: {
  label: string;
  items: T[];
  href: (item: T) => string;
  text: (item: T) => string;
  onPick: () => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section>
      <h2>{label}</h2>
      <ul>
        {items.map((item) => (
          <li key={href(item)}>
            <Link to={href(item)} viewTransition onClick={onPick}>
              {text(item)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
