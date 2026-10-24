import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { Presence } from '@/features/titles';
import { api, peekAny, type Featured, type Rail } from '@/lib/api';

type DiscoverPayload = {
  rails: Rail[];
  featured?: Featured | null;
};

export function Landing() {
  const { user } = useAuth();
  const cached = peekAny<DiscoverPayload>('/discover');
  const [featured, setFeatured] = useState<Featured | null>(
    () => cached?.featured ?? null,
  );

  useEffect(() => {
    void api<DiscoverPayload>('/discover')
      .then((d) => setFeatured(d.featured ?? null))
      .catch(() => {
        const fallback = peekAny<DiscoverPayload>('/discover');

        if (fallback?.featured) {
          setFeatured(fallback.featured);
        }
      });
  }, []);

  if (user) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <main>
      {featured ? (
        <Presence
          title={featured.title}
          cast={featured.cast}
          actions={
            <>
              <Link className="btn" to="/signup">
                Create account
              </Link>
              <Link className="btn ghost" to="/login">
                Sign in
              </Link>
            </>
          }
        />
      ) : (
        <div className="hero-block">
          <h1>
            Keep score of what you watch, then argue about it with friends.
          </h1>
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
      )}
    </main>
  );
}
