import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { CastStrip } from '@/features/titles';
import {
  api,
  peek,
  type CastMember,
  type Title,
  type User,
  type WatchOffer,
} from '@/lib/api';
import { errMessage } from '@/lib/err-message';
import { withNext } from '@/lib/next-path';

export function TitlePage() {
  const { mediaType = 'MOVIE', tmdbId = '' } = useParams();
  const { user } = useAuth();
  const loc = useLocation();
  const loginHref = withNext('/login', loc.pathname);
  const path = `/titles/${mediaType}/${tmdbId}`;
  const [data, setData] = useState<null | {
    title: Title;
    cast: CastMember[];
    providers: WatchOffer[];
    mine: { status: string; rating: number | null } | null;
    myLists: { id: string; name: string }[];
    reviews: { id: string; body: string; rating: number | null; user: User }[];
    friendStatuses: { user: User; status: string }[];
  }>(() => peek(path));
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [listsOpen, setListsOpen] = useState(false);
  const load = () =>
    api<NonNullable<typeof data>>(path)
      .then(setData)
      .catch((e: unknown) => setErr(errMessage(e)));

  useEffect(() => {
    void load();
  }, [path]);

  if (err) {
    return <main className="page error">{err}</main>;
  }

  if (!data) {
    return <main className="page-inner">Loading…</main>;
  }

  const t = data.title;

  async function setStatus(status: string) {
    await api(`/library/${mediaType}/${tmdbId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    await load();
  }
  async function addToList(listId: string) {
    await api(`/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify({ tmdbId: t.tmdbId, mediaType: t.mediaType }),
    });
    setMsg('Added');
    setListsOpen(false);
  }
  async function review(e: FormEvent) {
    e.preventDefault();
    await api('/reviews', {
      method: 'POST',
      body: JSON.stringify({ tmdbId: t.tmdbId, mediaType: t.mediaType, body }),
    });
    setBody('');
    await load();
  }

  return (
    <main>
      <section className="title-hero">
        {t.backdropUrl || t.posterUrl ? (
          <img
            className="back"
            src={t.backdropUrl || t.posterUrl || ''}
            alt=""
          />
        ) : null}
        <div className="copy">
          <p className="muted">
            {t.mediaType} {t.releaseDate?.slice(0, 4)}
          </p>
          <h1>{t.title}</h1>
          <p>{t.overview}</p>
          <div className="ext-links">
            {t.imdbUrl ? (
              <a href={t.imdbUrl} target="_blank" rel="noreferrer">
                IMDb
              </a>
            ) : null}
            {t.rtUrl ? (
              <a href={t.rtUrl} target="_blank" rel="noreferrer">
                Rotten Tomatoes
              </a>
            ) : null}
          </div>
          {data.providers.length ? (
            <div className="providers">
              {data.providers.map((p) =>
                p.logoUrl ? (
                  <img
                    key={p.name}
                    src={p.logoUrl}
                    alt={`${p.name} (${p.type})`}
                    title={`${p.name} · ${p.type}`}
                  />
                ) : (
                  <span key={p.name}>{p.name}</span>
                ),
              )}
            </div>
          ) : (
            <p className="muted">No watch offers for this region yet.</p>
          )}
          {user ? (
            <div className="row">
              {['WANT', 'WATCHING', 'WATCHED'].map((s) => (
                <button
                  key={s}
                  className={`chip ${data.mine?.status === s ? 'on' : ''}`}
                  onClick={() => setStatus(s)}
                >
                  {s === 'WANT'
                    ? 'Want'
                    : s === 'WATCHING'
                      ? 'Watching'
                      : 'Watched'}
                </button>
              ))}
              <button className="chip" onClick={() => setListsOpen((v) => !v)}>
                Add to list
              </button>
            </div>
          ) : (
            <div className="row">
              {['Want', 'Watching', 'Watched', 'Add to list'].map((label) => (
                <Link key={label} className="chip" to={loginHref}>
                  {label}
                </Link>
              ))}
            </div>
          )}
          {listsOpen ? (
            <div className="chips">
              {data.myLists.map((l) => (
                <button
                  key={l.id}
                  className="chip"
                  onClick={() => addToList(l.id)}
                >
                  {l.name}
                </button>
              ))}
              {!data.myLists.length ? (
                <span className="muted">Create a list first</span>
              ) : null}
            </div>
          ) : null}
          {msg ? <p className="muted">{msg}</p> : null}
        </div>
      </section>
      {(data.cast ?? []).length ? (
        <section className="cast-block" aria-labelledby="cast-heading">
          <h2 id="cast-heading">Cast</h2>
          <CastStrip cast={data.cast} />
        </section>
      ) : null}
      <div className="page-inner" style={{ paddingTop: 24 }}>
        {data.friendStatuses.length ? (
          <p className="muted">
            Friends:{' '}
            {data.friendStatuses
              .map((f) => `${f.user.username} (${f.status})`)
              .join(', ')}
          </p>
        ) : null}
        <h2>Reviews</h2>
        {user ? (
          <form onSubmit={review}>
            <label className="field">
              Your take
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                minLength={10}
                rows={3}
              />
            </label>
            <button className="btn" type="submit">
              Publish
            </button>
          </form>
        ) : null}
        {data.reviews.length ? (
          data.reviews.map((r) => (
            <article key={r.id} style={{ marginTop: 16 }}>
              <strong>
                <Link to={`/u/${r.user.username}`}>@{r.user.username}</Link>
              </strong>
              {r.rating ? <span className="muted"> {r.rating}/10</span> : null}
              <p>{r.body}</p>
            </article>
          ))
        ) : (
          <p className="muted">
            {user ? (
              'No reviews yet.'
            ) : (
              <>
                No reviews yet. <Link to={loginHref}>Sign in</Link> to write the
                first.
              </>
            )}
          </p>
        )}
      </div>
    </main>
  );
}
