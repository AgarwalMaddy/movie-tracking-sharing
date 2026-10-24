import { useState } from 'react';
import { Link } from 'react-router-dom';

import { prefetch, type Title } from '@/lib/api';

export function Poster({ title }: { title: Title }) {
  const href = `/title/${title.mediaType}/${title.tmdbId}`;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImg = Boolean(title.posterUrl) && title.posterUrl !== failedUrl;

  return (
    <div className="poster-card">
      <Link
        className="poster"
        to={href}
        viewTransition
        onMouseEnter={() =>
          prefetch(`/titles/${title.mediaType}/${title.tmdbId}`)
        }
      >
        {showImg ? (
          <img
            src={title.posterUrl ?? ''}
            alt=""
            onError={() => setFailedUrl(title.posterUrl)}
          />
        ) : (
          <div className="ph">{title.title}</div>
        )}
      </Link>
      <p className="cap">
        <Link to={href} viewTransition>
          {title.title}
        </Link>
        {title.releaseDate ? (
          <span className="year"> {title.releaseDate.slice(0, 4)}</span>
        ) : null}
      </p>
    </div>
  );
}

export function PosterGrid({ titles }: { titles: Title[] }) {
  return (
    <div className="grid">
      {titles.map((t) => (
        <Poster key={`${t.mediaType}-${t.tmdbId}`} title={t} />
      ))}
    </div>
  );
}

export function Rail({ label, titles }: { label: string; titles: Title[] }) {
  if (!titles.length) {
    return null;
  }

  return (
    <section className="rail">
      <h2>{label}</h2>
      <div className="scroller">
        {titles.map((t) => (
          <Poster key={`${t.mediaType}-${t.tmdbId}`} title={t} />
        ))}
      </div>
    </section>
  );
}
