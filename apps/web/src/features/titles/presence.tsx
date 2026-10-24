import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { type CastMember, type Title } from '@/lib/api';

function blurb(text: string | null | undefined) {
  if (!text) {
    return '';
  }

  return text.split(/\s+/).slice(0, 20).join(' ');
}

export function Presence({
  title,
  cast,
  eyebrow,
  actions,
}: {
  title: Title;
  cast: CastMember[];
  eyebrow?: string;
  actions?: ReactNode;
}) {
  const href = `/title/${title.mediaType}/${title.tmdbId}`;
  const faces = cast.filter((c) => c.imageUrl).slice(0, 5);
  const line = blurb(title.overview);

  return (
    <section className="presence">
      {title.backdropUrl ? (
        <img className="presence-back" src={title.backdropUrl} alt="" />
      ) : null}
      {faces.length ? (
        <div className="presence-cast" aria-hidden="true">
          {faces.map((c, i) => (
            <img
              key={c.id}
              src={c.imageUrl ?? ''}
              alt=""
              style={{ zIndex: faces.length - i }}
            />
          ))}
        </div>
      ) : null}
      <div className="presence-copy">
        {eyebrow ? <p className="presence-eye">{eyebrow}</p> : null}
        <h1>
          <Link to={href}>{title.title}</Link>
        </h1>
        {line ? <p className="lede">{line}</p> : null}
        <div className="row">
          {actions ?? (
            <Link className="btn" to={href}>
              Open title
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
