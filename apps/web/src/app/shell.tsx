import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { prefetch } from '@/lib/api';

const NAV_PREFETCH: Record<string, string[]> = {
  '/discover': ['/discover', '/discover/meta'],
  '/lists': [],
  '/activity': ['/activity'],
  '/collections': ['/collections'],
  '/library': ['/me/library?status=WATCHED'],
  '/reviews': ['/reviews'],
  '/friends': ['/friends'],
  '/inbox': ['/inbox'],
  '/history': ['/me/history'],
};

function PrefetchLink({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const paths = NAV_PREFETCH[to] ?? [];

  return (
    <NavLink
      to={to}
      className={className}
      onClick={onClick}
      onMouseEnter={() => {
        for (const p of paths) {
          prefetch(p);
        }
      }}
    >
      {children}
    </NavLink>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [morePath, setMorePath] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const more = morePath === loc.pathname;

  useEffect(() => {
    prefetch('/discover');
    prefetch('/discover/meta');
    prefetch('/collections');
  }, []);

  function goSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();

    if (query.length < 2) {
      void nav('/search');

      return;
    }

    void nav(`/search?q=${encodeURIComponent(query)}`);
  }

  const youHref = user ? `/u/${user.username}` : '/login';

  return (
    <div className="shell">
      <header className="top">
        <NavLink to={user ? '/discover' : '/'} className="brand">
          Reelwright
        </NavLink>
        <nav className="nav">
          <PrefetchLink to="/discover">Discover</PrefetchLink>
          <PrefetchLink to="/lists">Lists</PrefetchLink>
          <PrefetchLink to="/activity">Activity</PrefetchLink>
          <PrefetchLink to="/collections">Collections</PrefetchLink>
        </nav>
        <form className="header-search" onSubmit={goSearch}>
          <label className="sr-only" htmlFor="header-search">
            Search titles
          </label>
          <input
            id="header-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles"
          />
        </form>
        <div className="spacer" />
        <button
          className="text-btn"
          aria-expanded={more}
          onClick={() => setMorePath(more ? null : loc.pathname)}
        >
          More
        </button>
        {user ? (
          <NavLink to={`/u/${user.username}`} className="avatar">
            @{user.username}
          </NavLink>
        ) : (
          <NavLink to="/login">Sign in</NavLink>
        )}
        {more ? (
          <div className="more-panel">
            <PrefetchLink to="/library" onClick={() => setMorePath(null)}>
              Library
            </PrefetchLink>
            <PrefetchLink to="/reviews" onClick={() => setMorePath(null)}>
              Reviews
            </PrefetchLink>
            <PrefetchLink to="/friends" onClick={() => setMorePath(null)}>
              Friends
            </PrefetchLink>
            <PrefetchLink to="/inbox" onClick={() => setMorePath(null)}>
              Inbox
            </PrefetchLink>
            <PrefetchLink to="/history" onClick={() => setMorePath(null)}>
              Watch log
            </PrefetchLink>
            <PrefetchLink to="/search" onClick={() => setMorePath(null)}>
              Search
            </PrefetchLink>
          </div>
        ) : null}
      </header>
      <div className="shell-body">{children}</div>
      <nav className="bottom-nav" aria-label="Primary">
        <PrefetchLink to="/discover">Discover</PrefetchLink>
        <PrefetchLink to="/search">Search</PrefetchLink>
        <PrefetchLink to={user ? '/library' : '/login'}>Library</PrefetchLink>
        <PrefetchLink to={youHref}>{user ? 'You' : 'Sign in'}</PrefetchLink>
      </nav>
      <footer className="site-foot">
        <div>
          <strong>Reelwright</strong>
          <p>Public profiles, lists, and a watch log. Title data from TMDB.</p>
        </div>
        <nav>
          <Link to="/discover">Discover</Link>
          <Link to="/search">Search</Link>
          <Link to="/lists">Lists</Link>
          <Link to="/collections">Collections</Link>
        </nav>
        <p className="attr">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </footer>
    </div>
  );
}
