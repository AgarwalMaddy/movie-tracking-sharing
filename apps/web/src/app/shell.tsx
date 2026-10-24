import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { SearchPalette } from '@/features/search';
import { prefetch } from '@/lib/api';

const NAV_PREFETCH: Record<string, string[]> = {
  '/discover': ['/discover', '/discover/meta'],
  '/lists': ['/lists'],
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
      viewTransition
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
  const loc = useLocation();
  const [morePath, setMorePath] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const more = morePath === loc.pathname;
  const closePalette = useCallback(() => setPalette(false), []);

  useEffect(() => {
    prefetch('/discover');
    prefetch('/discover/meta');
    prefetch('/collections');
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((open) => !open);
      }
    }

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const youHref = user ? `/u/${user.username}` : '/login';

  return (
    <div className="shell">
      <header className="top">
        <NavLink to={user ? '/discover' : '/'} className="brand" viewTransition>
          Reelwright
        </NavLink>
        <nav className="nav">
          <PrefetchLink to="/discover">Discover</PrefetchLink>
          <PrefetchLink to="/lists">Lists</PrefetchLink>
          <PrefetchLink to="/activity">Activity</PrefetchLink>
          <PrefetchLink to="/collections">Collections</PrefetchLink>
        </nav>
        <button
          type="button"
          className="header-search"
          aria-haspopup="dialog"
          onClick={() => setPalette(true)}
        >
          Search
          <kbd>Ctrl K</kbd>
        </button>
        <div className="spacer" />
        <button
          className="text-btn"
          aria-expanded={more}
          onClick={() => setMorePath(more ? null : loc.pathname)}
        >
          More
        </button>
        {user ? (
          <NavLink to={`/u/${user.username}`} className="avatar" viewTransition>
            @{user.username}
          </NavLink>
        ) : (
          <NavLink to="/login" viewTransition>
            Sign in
          </NavLink>
        )}
        {more ? (
          <div className="more-panel">
            {user ? (
              <>
                <PrefetchLink to="/library" onClick={() => setMorePath(null)}>
                  Library
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
              </>
            ) : null}
            <PrefetchLink to="/reviews" onClick={() => setMorePath(null)}>
              Reviews
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
          <Link to="/discover" viewTransition>
            Discover
          </Link>
          <Link to="/search" viewTransition>
            Search
          </Link>
          <Link to="/lists" viewTransition>
            Lists
          </Link>
          <Link to="/collections" viewTransition>
            Collections
          </Link>
        </nav>
        <p className="attr">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </footer>
      <SearchPalette open={palette} onClose={closePalette} />
    </div>
  );
}
