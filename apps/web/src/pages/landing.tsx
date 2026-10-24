import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { AuthExtras, useAuth } from '@/features/auth';
import { Presence, Rail as PosterRail } from '@/features/titles';
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
  const [rails, setRails] = useState<Rail[]>(() => cached?.rails ?? []);

  useEffect(() => {
    void api<DiscoverPayload>('/discover')
      .then((d) => {
        setFeatured(d.featured ?? null);
        setRails(d.rails);
      })
      .catch(() => {
        const fallback = peekAny<DiscoverPayload>('/discover');

        if (fallback?.featured) {
          setFeatured(fallback.featured);
        }

        if (fallback?.rails.length) {
          setRails(fallback.rails);
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
              <Link className="btn" to="/signup" viewTransition>
                Create account
              </Link>
              <Link className="btn ghost" to="/login" viewTransition>
                Sign in
              </Link>
              <AuthExtras next="/discover" />
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
            <Link className="btn" to="/signup" viewTransition>
              Create account
            </Link>
            <Link className="btn ghost" to="/login" viewTransition>
              Sign in
            </Link>
            <AuthExtras next="/discover" />
          </div>
        </div>
      )}
      <section className="home-points" aria-label="How it works">
        <div>
          <h2>Log it</h2>
          <p>Watched, watching, or want. Ratings live on the title.</p>
        </div>
        <div>
          <h2>List it</h2>
          <p>Public lists anyone can open from your profile.</p>
        </div>
        <div>
          <h2>Share the log</h2>
          <p>Profiles, reviews, and activity are public by default.</p>
        </div>
      </section>
      {rails.map((r) => (
        <PosterRail key={r.id} label={r.label} titles={r.titles} />
      ))}
    </main>
  );
}
