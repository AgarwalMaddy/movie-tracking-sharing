import { useEffect, useState } from 'react';

import { PosterGrid, Presence, Rail as PosterRail } from '@/features/titles';
import {
  api,
  peek,
  peekAny,
  type Featured,
  type Genre,
  type Language,
  type Person,
  type Rail,
  type Title,
} from '@/lib/api';
import { errMessage } from '@/lib/err-message';

const YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2010s',
  '2000s',
  '1990s',
  '1980s',
];
const LANG_FALLBACK: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
];

type FilterCat =
  'year' | 'genre' | 'actor' | 'actress' | 'director' | 'language';

type DiscoverPayload = {
  rails: Rail[];
  featured?: Featured | null;
  stale?: boolean;
};

export function Discover() {
  const cached = peekAny<DiscoverPayload>('/discover');
  const [rails, setRails] = useState<Rail[]>(() => cached?.rails ?? []);
  const [featured, setFeatured] = useState<Featured | null>(
    () => cached?.featured ?? null,
  );
  const [stale, setStale] = useState(Boolean(cached?.stale));
  const [kind, setKind] = useState<'all' | 'movie' | 'tv'>('all');
  const [sort, setSort] = useState('trending');
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<FilterCat | null>(null);
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [person, setPerson] = useState<Person | null>(null);
  const [credit, setCredit] = useState<'cast' | 'crew'>('cast');
  const [genres, setGenres] = useState<Genre[]>(
    () => peek<{ genres: Genre[] }>('/discover/meta')?.genres ?? [],
  );
  const [languages, setLanguages] = useState<Language[]>(
    () =>
      peek<{ languages: Language[] }>('/discover/meta')?.languages ??
      LANG_FALLBACK,
  );
  const [peopleQ, setPeopleQ] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [browse, setBrowse] = useState<Title[]>([]);
  const filtering = Boolean(year || genre || language || person);

  useEffect(() => {
    void api<DiscoverPayload>('/discover')
      .then((d) => {
        setRails(d.rails);
        setFeatured(d.featured ?? null);
        setStale(Boolean(d.stale));
        setErr('');
      })
      .catch((e: unknown) => {
        const fallback = peekAny<DiscoverPayload>('/discover');

        if (fallback?.rails.length) {
          setRails(fallback.rails);
          setFeatured(fallback.featured ?? null);
          setStale(true);
          setErr('Showing saved titles. Catalog is catching up.');

          return;
        }

        setErr(errMessage(e));
      });
    void api<{ genres: Genre[]; languages: Language[] }>('/discover/meta')
      .then((d) => {
        setGenres(d.genres);
        setLanguages(d.languages);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!filtering) {
      setBrowse([]);

      return;
    }

    const qs = new URLSearchParams();

    if (year) {
      qs.set('year', year);
    }

    if (genre) {
      qs.set('genre', genre);
    }

    if (language) {
      qs.set('language', language);
    }

    if (person) {
      qs.set('person', String(person.id));
      qs.set('credit', credit);
    }

    const kinds =
      kind === 'all' ? (['movie', 'tv'] as const) : ([kind] as const);

    void Promise.all(
      kinds.map((k) =>
        api<{ titles: Title[] }>(`/discover/browse?kind=${k}&${qs.toString()}`),
      ),
    )
      .then((rows) => setBrowse(rows.flatMap((r) => r.titles)))
      .catch((e: unknown) => setErr(errMessage(e)));
  }, [filtering, year, genre, language, person, credit, kind]);

  useEffect(() => {
    if (open !== 'actor' && open !== 'actress' && open !== 'director') {
      return;
    }

    if (peopleQ.trim().length < 2) {
      setPeople([]);

      return;
    }

    const t = window.setTimeout(() => {
      void api<{ people: Person[] }>(
        `/discover/people?role=${open}&q=${encodeURIComponent(peopleQ.trim())}`,
      )
        .then((d) => setPeople(d.people))
        .catch(() => undefined);
    }, 220);

    return () => window.clearTimeout(t);
  }, [open, peopleQ]);

  const shown = rails.filter(
    (r) => kind === 'all' || r.kind === 'all' || r.kind === kind,
  );
  const ordered =
    sort === 'top'
      ? [...shown].sort((a, b) =>
          a.id === 'top' ? -1 : b.id === 'top' ? 1 : 0,
        )
      : sort === 'soon'
        ? [...shown].sort((a, b) =>
            a.id === 'upcoming' ? -1 : b.id === 'upcoming' ? 1 : 0,
          )
        : shown;

  function pickCat(cat: FilterCat) {
    setOpen((cur) => (cur === cat ? null : cat));

    if (cat === 'director') {
      setCredit('crew');
    }

    if (cat === 'actor' || cat === 'actress') {
      setCredit('cast');
    }
  }

  function clearFilters() {
    setYear('');
    setGenre('');
    setLanguage('');
    setPerson(null);
    setPeopleQ('');
    setPeople([]);
    setOpen(null);
  }

  return (
    <main className="page">
      {featured ? (
        <Presence title={featured.title} cast={featured.cast} />
      ) : (
        <div className="hero-block">
          <h1>Discover</h1>
          <p className="lede">
            This week, theatres, coming soon, and series. Filter by year, genre,
            people, or language.
          </p>
        </div>
      )}
      <div className="chips">
        {(['all', 'movie', 'tv'] as const).map((k) => (
          <button
            key={k}
            className="chip"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
          >
            {k === 'all' ? 'All' : k === 'movie' ? 'Movies' : 'Series'}
          </button>
        ))}
      </div>
      <p className="filter-label">Filter by</p>
      <div className="chips">
        {(
          [
            ['year', 'Year'],
            ['genre', 'Genre'],
            ['actor', 'Actor'],
            ['actress', 'Actress'],
            ['director', 'Director'],
            ['language', 'Language'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className="chip"
            aria-pressed={open === id}
            onClick={() => pickCat(id)}
          >
            {label}
          </button>
        ))}
        {filtering ? (
          <button className="chip on" onClick={clearFilters}>
            Clear filters
          </button>
        ) : null}
      </div>
      {open === 'year' ? (
        <div className="chips">
          {YEARS.map((y) => (
            <button
              key={y}
              className="chip"
              aria-pressed={year === y}
              onClick={() => setYear(year === y ? '' : y)}
            >
              {y}
            </button>
          ))}
        </div>
      ) : null}
      {open === 'genre' ? (
        <div className="chips">
          {genres.map((g) => (
            <button
              key={g.id}
              className="chip"
              aria-pressed={genre === String(g.id)}
              onClick={() =>
                setGenre(genre === String(g.id) ? '' : String(g.id))
              }
            >
              {g.name}
            </button>
          ))}
        </div>
      ) : null}
      {open === 'language' ? (
        <div className="chips">
          {languages.map((l) => (
            <button
              key={l.code}
              className="chip"
              aria-pressed={language === l.code}
              onClick={() => setLanguage(language === l.code ? '' : l.code)}
            >
              {l.name}
            </button>
          ))}
        </div>
      ) : null}
      {open === 'actor' || open === 'actress' || open === 'director' ? (
        <div className="page-inner person-filter">
          <input
            className="search"
            value={peopleQ}
            onChange={(e) => setPeopleQ(e.target.value)}
            placeholder={`Search ${open}`}
          />
          <div className="chips" style={{ padding: 0 }}>
            {person ? (
              <button
                className="chip"
                aria-pressed
                onClick={() => setPerson(null)}
              >
                {person.name}
              </button>
            ) : null}
            {people.map((p) => (
              <button
                key={p.id}
                className="chip"
                aria-pressed={person?.id === p.id}
                onClick={() => setPerson(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {!filtering ? (
        <div className="chips">
          {[
            ['trending', 'This week first'],
            ['soon', 'Coming soon first'],
            ['top', 'Top rated first'],
          ].map(([id, label]) => (
            <button
              key={id}
              className="chip"
              aria-pressed={sort === id}
              onClick={() => setSort(id)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {stale && !err ? (
        <p className="muted page-inner">Showing the last saved catalog.</p>
      ) : null}
      {err ? <p className="error">{err}</p> : null}
      {filtering ? (
        <PosterGrid titles={browse} />
      ) : (
        ordered.map((r) => (
          <PosterRail key={r.id} label={r.label} titles={r.titles} />
        ))
      )}
    </main>
  );
}
