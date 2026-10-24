import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { api, type Rail, type Title } from '@/lib/api';

export function Landing() {
  const { user } = useAuth();
  const [trending, setTrending] = useState<Title[]>([]);

  useEffect(() => {
    void api<{ rails: Rail[] }>('/discover')
      .then((d) => setTrending(d.rails[0]?.titles.slice(0, 8) ?? []))
      .catch(() => undefined);
  }, []);

  if (user) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <main>
      <div className="hero-block">
        <h1>Keep score of what you watch, then argue about it with friends.</h1>
        <p className="lede">
          Public profiles, lists, reviews, and a watch log. TMDB for titles.
        </p>
        <div className="row">
          <Link className="btn" to="/signup">
            Create account
          </Link>
          <Link className="btn ghost" to="/login">
            Sign in
          </Link>
        </div>
      </div>
      <div className="landing-posters">
        {trending.map((t) =>
          t.posterUrl ? (
            <img key={t.tmdbId} src={t.posterUrl} alt={t.title} />
          ) : null,
        )}
      </div>
    </main>
  );
}
