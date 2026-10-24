import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    prefetch('/discover');
    prefetch('/discover/meta');
    prefetch('/collections');
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    }
  }, [searchOpen]);

  function goSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();

    if (query.length < 2) {
      return;
    }

    setSearchOpen(false);
    void nav(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="shell">
      <header className="top">
        <NavLink to="/" className="brand">
          Reelwright
        </NavLink>
        <nav className="nav">
          <PrefetchLink to="/discover">Discover</PrefetchLink>
          <PrefetchLink to="/lists">Lists</PrefetchLink>
          <PrefetchLink to="/activity">Activity</PrefetchLink>
          <PrefetchLink to="/collections">Collections</PrefetchLink>
        </nav>
        <div className="spacer" />
        <button
          className="icon-btn"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          ⌕
        </button>
        <button
          className="icon-btn"
          aria-label="More"
          onClick={() => setMore((v) => !v)}
        >
          ···
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
            <PrefetchLink to="/discover" onClick={() => setMore(false)}>
              Discover
            </PrefetchLink>
            <PrefetchLink to="/library" onClick={() => setMore(false)}>
              Library
            </PrefetchLink>
            <PrefetchLink to="/reviews" onClick={() => setMore(false)}>
              Reviews
            </PrefetchLink>
            <PrefetchLink to="/friends" onClick={() => setMore(false)}>
              Friends
            </PrefetchLink>
            <PrefetchLink to="/inbox" onClick={() => setMore(false)}>
              Inbox
            </PrefetchLink>
            <PrefetchLink to="/history" onClick={() => setMore(false)}>
              Watch log
            </PrefetchLink>
          </div>
        ) : null}
      </header>
      {searchOpen ? (
        <div className="overlay">
          <button
            type="button"
            className="overlay-dismiss"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
          <form onSubmit={goSearch}>
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles"
            />
          </form>
        </div>
      ) : null}
      <div className="shell-body">{children}</div>
      <footer className="site-foot">
        <div>
          <strong>Reelwright</strong>
          <p>Public profiles, lists, and a watch log. Title data from TMDB.</p>
        </div>
        <nav>
          <Link to="/discover">Discover</Link>
          <Link to="/lists">Lists</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/activity">Activity</Link>
        </nav>
        <p className="attr">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </footer>
    </div>
  );
}
