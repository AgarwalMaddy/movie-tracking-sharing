import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { type CastMember, type Title } from '@/lib/api';

import { CastStrip } from './cast';

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

  return (
    <section className="presence">
      {title.backdropUrl ? (
        <img className="presence-back" src={title.backdropUrl} alt="" />
      ) : null}
      <div className="presence-copy">
        {eyebrow ? <p className="presence-eye">{eyebrow}</p> : null}
        <h1>
          <Link to={href} viewTransition>
            {title.title}
          </Link>
        </h1>
        {title.overview ? <p className="lede">{title.overview}</p> : null}
        <CastStrip cast={cast} compact />
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
