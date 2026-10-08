import { FormEvent, useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { prefetch, type Title } from "../api"
import { useAuth } from "../auth"

const NAV_PREFETCH: Record<string, string[]> = {
  "/discover": ["/discover", "/discover/meta"],
  "/lists": [],
  "/activity": ["/activity"],
  "/collections": ["/collections"],
  "/library": ["/me/library?status=WATCHED"],
  "/reviews": ["/reviews"],
  "/friends": ["/friends"],
  "/inbox": ["/inbox"],
  "/history": ["/me/history"],
}

function PrefetchLink({
  to,
  children,
  className,
  onClick,
}: {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const paths = NAV_PREFETCH[to] ?? []
  return (
    <NavLink
      to={to}
      className={className}
      onClick={onClick}
      onMouseEnter={() => paths.forEach((p) => prefetch(p))}
    >
      {children}
    </NavLink>
  )
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const nav = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [more, setMore] = useState(false)
  const [q, setQ] = useState("")

  useEffect(() => {
    prefetch("/discover")
    prefetch("/discover/meta")
    prefetch("/collections")
  }, [])

  function goSearch(e: FormEvent) {
    e.preventDefault()
    const query = q.trim()
    if (query.length < 2) return
    setSearchOpen(false)
    nav(`/search?q=${encodeURIComponent(query)}`)
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
        <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
          ⌕
        </button>
        <button className="icon-btn" aria-label="More" onClick={() => setMore((v) => !v)}>
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
        <div className="overlay" onClick={() => setSearchOpen(false)}>
          <form onSubmit={goSearch} onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
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
        <p className="attr">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </footer>
    </div>
  )
}

export function Poster({ title }: { title: Title }) {
  const href = `/title/${title.mediaType}/${title.tmdbId}`
  return (
    <div className="poster-card">
      <Link
        className="poster"
        to={href}
        onMouseEnter={() => prefetch(`/titles/${title.mediaType}/${title.tmdbId}`)}
      >
        {title.posterUrl ? <img src={title.posterUrl} alt="" /> : <div className="ph">{title.title}</div>}
      </Link>
      <p className="cap">
        <Link to={href}>{title.title}</Link>
        {title.releaseDate ? <span className="year"> {title.releaseDate.slice(0, 4)}</span> : null}
      </p>
    </div>
  )
}

export function PosterGrid({ titles }: { titles: Title[] }) {
  return (
    <div className="grid">
      {titles.map((t) => (
        <Poster key={`${t.mediaType}-${t.tmdbId}`} title={t} />
      ))}
    </div>
  )
}

export function Rail({ label, titles }: { label: string; titles: Title[] }) {
  if (!titles.length) return null
  return (
    <section className="rail">
      <h2>{label}</h2>
      <div className="scroller">
        {titles.map((t) => (
          <Poster key={`${t.mediaType}-${t.tmdbId}`} title={t} />
        ))}
      </div>
    </section>
  )
}
