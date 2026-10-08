import { FormEvent, useEffect, useState } from "react"
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  api,
  bustCache,
  peek,
  setToken,
  type Genre,
  type Language,
  type Person,
  type Rail,
  type Title,
  type User,
  type WatchOffer,
} from "./api"
import { useAuth } from "./auth"
import { PosterGrid, Rail as PosterRail } from "./components/ui"

export function Landing() {
  const { user } = useAuth()
  const [trending, setTrending] = useState<Title[]>([])
  useEffect(() => {
    api<{ rails: Rail[] }>("/discover")
      .then((d) => setTrending(d.rails[0]?.titles.slice(0, 8) ?? []))
      .catch(() => undefined)
  }, [])
  if (user) return <Navigate to="/discover" replace />
  return (
    <main>
      <div className="hero-block">
        <h1>Keep score of what you watch, then argue about it with friends.</h1>
        <p className="lede">Public profiles, lists, reviews, and a watch log. TMDB for titles.</p>
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
          t.posterUrl ? <img key={t.tmdbId} src={t.posterUrl} alt={t.title} /> : null
        )}
      </div>
    </main>
  )
}

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { refresh } = useAuth()
  const nav = useNavigate()
  const [error, setError] = useState("")
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const fd = new FormData(e.currentTarget)
    try {
      if (mode === "signup") {
        const data = await api<{ accessToken?: string }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: fd.get("name"),
            email: fd.get("email"),
            password: fd.get("password"),
            username: String(fd.get("username") ?? "").toLowerCase(),
          }),
        })
        if (data.accessToken) setToken(data.accessToken)
        bustCache()
        await refresh()
        nav("/discover")
      } else {
        const data = await api<{ accessToken: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
        })
        setToken(data.accessToken)
        bustCache()
        await refresh()
        nav("/discover")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    }
  }
  return (
    <main className="auth-wrap">
      <h1>{mode === "signup" ? "Join Reelwright" : "Welcome back"}</h1>
      <form onSubmit={onSubmit} style={{ marginTop: 24 }}>
        {mode === "signup" ? (
          <>
            <label className="field">
              Name
              <input name="name" required />
            </label>
            <label className="field">
              Username
              <input name="username" required minLength={3} pattern="[a-zA-Z0-9_]+" />
            </label>
          </>
        ) : null}
        <label className="field">
          Email
          <input name="email" type="email" required />
        </label>
        <label className="field">
          Password
          <input name="password" type="password" required minLength={8} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
        <p className="muted" style={{ marginTop: 12 }}>
          {mode === "signup" ? (
            <Link to="/login">Already have an account</Link>
          ) : (
            <Link to="/signup">Create one</Link>
          )}
        </p>
      </form>
    </main>
  )
}

export function Login() {
  return <AuthForm mode="login" />
}
export function Signup() {
  return <AuthForm mode="signup" />
}

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2010s", "2000s", "1990s", "1980s"]
const LANG_FALLBACK: Language[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
]
type FilterCat = "year" | "genre" | "actor" | "actress" | "director" | "language"

export function Discover() {
  const [rails, setRails] = useState<Rail[]>(() => peek<{ rails: Rail[] }>("/discover")?.rails ?? [])
  const [kind, setKind] = useState<"all" | "movie" | "tv">("all")
  const [sort, setSort] = useState("trending")
  const [err, setErr] = useState("")
  const [open, setOpen] = useState<FilterCat | null>(null)
  const [year, setYear] = useState("")
  const [genre, setGenre] = useState("")
  const [language, setLanguage] = useState("")
  const [person, setPerson] = useState<Person | null>(null)
  const [credit, setCredit] = useState<"cast" | "crew">("cast")
  const [genres, setGenres] = useState<Genre[]>(() => peek<{ genres: Genre[] }>("/discover/meta")?.genres ?? [])
  const [languages, setLanguages] = useState<Language[]>(
    () => peek<{ languages: Language[] }>("/discover/meta")?.languages ?? LANG_FALLBACK
  )
  const [peopleQ, setPeopleQ] = useState("")
  const [people, setPeople] = useState<Person[]>([])
  const [browse, setBrowse] = useState<Title[]>([])
  const filtering = Boolean(year || genre || language || person)

  useEffect(() => {
    api<{ rails: Rail[] }>("/discover")
      .then((d) => setRails(d.rails))
      .catch((e) => setErr(e.message))
    api<{ genres: Genre[]; languages: Language[] }>("/discover/meta")
      .then((d) => {
        setGenres(d.genres)
        setLanguages(d.languages)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!filtering) {
      setBrowse([])
      return
    }
    const qs = new URLSearchParams()
    if (year) qs.set("year", year)
    if (genre) qs.set("genre", genre)
    if (language) qs.set("language", language)
    if (person) {
      qs.set("person", String(person.id))
      qs.set("credit", credit)
    }
    const kinds = kind === "all" ? (["movie", "tv"] as const) : ([kind] as const)
    Promise.all(kinds.map((k) => api<{ titles: Title[] }>(`/discover/browse?kind=${k}&${qs.toString()}`)))
      .then((rows) => setBrowse(rows.flatMap((r) => r.titles)))
      .catch((e) => setErr(e.message))
  }, [filtering, year, genre, language, person, credit, kind])

  useEffect(() => {
    if (open !== "actor" && open !== "actress" && open !== "director") return
    if (peopleQ.trim().length < 2) {
      setPeople([])
      return
    }
    const t = window.setTimeout(() => {
      api<{ people: Person[] }>(`/discover/people?role=${open}&q=${encodeURIComponent(peopleQ.trim())}`)
        .then((d) => setPeople(d.people))
        .catch(() => undefined)
    }, 220)
    return () => window.clearTimeout(t)
  }, [open, peopleQ])

  const shown = rails.filter((r) => kind === "all" || r.kind === "all" || r.kind === kind)
  const ordered =
    sort === "top"
      ? [...shown].sort((a, b) => (a.id === "top" ? -1 : b.id === "top" ? 1 : 0))
      : sort === "soon"
        ? [...shown].sort((a, b) => (a.id === "upcoming" ? -1 : b.id === "upcoming" ? 1 : 0))
        : shown

  function pickCat(cat: FilterCat) {
    setOpen((cur) => (cur === cat ? null : cat))
    if (cat === "director") setCredit("crew")
    if (cat === "actor" || cat === "actress") setCredit("cast")
  }

  function clearFilters() {
    setYear("")
    setGenre("")
    setLanguage("")
    setPerson(null)
    setPeopleQ("")
    setPeople([])
    setOpen(null)
  }

  return (
    <main className="page">
      <div className="hero-block">
        <h1>Discover</h1>
        <p className="lede">This week, theatres, coming soon, and series. Filter by year, genre, people, or language.</p>
      </div>
      <div className="chips">
        {(["all", "movie", "tv"] as const).map((k) => (
          <button key={k} className="chip" aria-selected={kind === k} onClick={() => setKind(k)}>
            {k === "all" ? "All" : k === "movie" ? "Movies" : "Series"}
          </button>
        ))}
      </div>
      <p className="filter-label">Filter by</p>
      <div className="chips">
        {(
          [
            ["year", "Year"],
            ["genre", "Genre"],
            ["actor", "Actor"],
            ["actress", "Actress"],
            ["director", "Director"],
            ["language", "Language"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className="chip" aria-selected={open === id} onClick={() => pickCat(id)}>
            {label}
          </button>
        ))}
        {filtering ? (
          <button className="chip on" onClick={clearFilters}>
            Clear filters
          </button>
        ) : null}
      </div>
      {open === "year" ? (
        <div className="chips">
          {YEARS.map((y) => (
            <button key={y} className="chip" aria-selected={year === y} onClick={() => setYear(year === y ? "" : y)}>
              {y}
            </button>
          ))}
        </div>
      ) : null}
      {open === "genre" ? (
        <div className="chips">
          {genres.map((g) => (
            <button
              key={g.id}
              className="chip"
              aria-selected={genre === String(g.id)}
              onClick={() => setGenre(genre === String(g.id) ? "" : String(g.id))}
            >
              {g.name}
            </button>
          ))}
        </div>
      ) : null}
      {open === "language" ? (
        <div className="chips">
          {languages.map((l) => (
            <button
              key={l.code}
              className="chip"
              aria-selected={language === l.code}
              onClick={() => setLanguage(language === l.code ? "" : l.code)}
            >
              {l.name}
            </button>
          ))}
        </div>
      ) : null}
      {open === "actor" || open === "actress" || open === "director" ? (
        <div className="page-inner person-filter">
          <input
            className="search"
            value={peopleQ}
            onChange={(e) => setPeopleQ(e.target.value)}
            placeholder={`Search ${open}`}
          />
          <div className="chips" style={{ padding: 0 }}>
            {person ? (
              <button className="chip" aria-selected onClick={() => setPerson(null)}>
                {person.name}
              </button>
            ) : null}
            {people.map((p) => (
              <button key={p.id} className="chip" aria-selected={person?.id === p.id} onClick={() => setPerson(p)}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {!filtering ? (
        <div className="chips">
          {[
            ["trending", "This week first"],
            ["soon", "Coming soon first"],
            ["top", "Top rated first"],
          ].map(([id, label]) => (
            <button key={id} className="chip" aria-selected={sort === id} onClick={() => setSort(id)}>
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {err ? <p className="error">{err}</p> : null}
      {filtering ? (
        <PosterGrid titles={browse} />
      ) : (
        ordered.map((r) => <PosterRail key={r.id} label={r.label} titles={r.titles} />)
      )}
    </main>
  )
}

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get("q") ?? ""
  const [results, setResults] = useState<Title[]>([])
  useEffect(() => {
    if (q.length < 2) return
    api<{ results: Title[] }>(`/titles/search?q=${encodeURIComponent(q)}`).then((d) => setResults(d.results))
  }, [q])
  return (
    <main className="page">
      <div className="hero-block">
        <h1>Search</h1>
        <p className="lede">{q || "Open search from the header."}</p>
      </div>
      <PosterGrid titles={results} />
    </main>
  )
}

export function TitlePage() {
  const { mediaType = "MOVIE", tmdbId = "" } = useParams()
  const { user } = useAuth()
  const path = `/titles/${mediaType}/${tmdbId}`
  const [data, setData] = useState<null | {
    title: Title
    providers: WatchOffer[]
    mine: { status: string; rating: number | null } | null
    myLists: { id: string; name: string }[]
    reviews: { id: string; body: string; rating: number | null; user: User }[]
    friendStatuses: { user: User; status: string }[]
  }>(() => peek(path))
  const [body, setBody] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const [listsOpen, setListsOpen] = useState(false)
  const load = () =>
    api<NonNullable<typeof data>>(path).then(setData).catch((e) => setErr(e.message))
  useEffect(() => {
    void load()
  }, [path])
  if (err) return <main className="page error">{err}</main>
  if (!data) return <main className="page-inner">Loading…</main>
  const t = data.title
  async function setStatus(status: string) {
    await api(`/library/${mediaType}/${tmdbId}`, { method: "PUT", body: JSON.stringify({ status }) })
    await load()
  }
  async function addToList(listId: string) {
    await api(`/lists/${listId}/items`, {
      method: "POST",
      body: JSON.stringify({ tmdbId: t.tmdbId, mediaType: t.mediaType }),
    })
    setMsg("Added")
    setListsOpen(false)
  }
  async function review(e: FormEvent) {
    e.preventDefault()
    await api("/reviews", {
      method: "POST",
      body: JSON.stringify({ tmdbId: t.tmdbId, mediaType: t.mediaType, body }),
    })
    setBody("")
    await load()
  }
  return (
    <main>
      <section className="title-hero">
        {t.backdropUrl || t.posterUrl ? (
          <img className="back" src={t.backdropUrl || t.posterUrl || ""} alt="" />
        ) : null}
        <div className="copy">
          <p className="muted">
            {t.mediaType} {t.releaseDate?.slice(0, 4)}
          </p>
          <h1>{t.title}</h1>
          <p>{t.overview}</p>
          <div className="ext-links">
            {t.imdbUrl ? (
              <a href={t.imdbUrl} target="_blank" rel="noreferrer">
                IMDb
              </a>
            ) : null}
            {t.rtUrl ? (
              <a href={t.rtUrl} target="_blank" rel="noreferrer">
                Rotten Tomatoes
              </a>
            ) : null}
          </div>
          {data.providers.length ? (
            <div className="providers">
              {data.providers.map((p) =>
                p.logoUrl ? (
                  <img key={p.name} src={p.logoUrl} alt={`${p.name} (${p.type})`} title={`${p.name} · ${p.type}`} />
                ) : (
                  <span key={p.name}>{p.name}</span>
                )
              )}
            </div>
          ) : (
            <p className="muted">No watch offers for this region yet.</p>
          )}
          {user ? (
            <div className="row">
              {["WANT", "WATCHING", "WATCHED"].map((s) => (
                <button key={s} className={`chip ${data.mine?.status === s ? "on" : ""}`} onClick={() => setStatus(s)}>
                  {s === "WANT" ? "Want" : s === "WATCHING" ? "Watching" : "Watched"}
                </button>
              ))}
              <button className="chip" onClick={() => setListsOpen((v) => !v)}>
                Add to list
              </button>
            </div>
          ) : (
            <p>
              <Link to="/login">Sign in</Link> to log this.
            </p>
          )}
          {listsOpen ? (
            <div className="chips">
              {data.myLists.map((l) => (
                <button key={l.id} className="chip" onClick={() => addToList(l.id)}>
                  {l.name}
                </button>
              ))}
              {!data.myLists.length ? <span className="muted">Create a list first</span> : null}
            </div>
          ) : null}
          {msg ? <p className="muted">{msg}</p> : null}
        </div>
      </section>
      <div className="page-inner" style={{ paddingTop: 24 }}>
        {data.friendStatuses.length ? (
          <p className="muted">
            Friends: {data.friendStatuses.map((f) => `${f.user.username} (${f.status})`).join(", ")}
          </p>
        ) : null}
        <h2>Reviews</h2>
        {user ? (
          <form onSubmit={review}>
            <label className="field">
              Your take
              <textarea value={body} onChange={(e) => setBody(e.target.value)} minLength={10} rows={3} />
            </label>
            <button className="btn" type="submit">
              Publish
            </button>
          </form>
        ) : null}
        {data.reviews.map((r) => (
          <article key={r.id} style={{ marginTop: 16 }}>
            <strong>
              <Link to={`/u/${r.user.username}`}>@{r.user.username}</Link>
            </strong>
            {r.rating ? <span className="muted"> {r.rating}/10</span> : null}
            <p>{r.body}</p>
          </article>
        ))}
      </div>
    </main>
  )
}

export function Library() {
  const [tab, setTab] = useState("WATCHED")
  const [entries, setEntries] = useState<{ status: string; title: Title }[]>(
    () => peek<{ entries: { status: string; title: Title }[] }>(`/me/library?status=WATCHED`)?.entries ?? []
  )
  useEffect(() => {
    api<{ entries: { status: string; title: Title }[] }>(`/me/library?status=${tab}`).then((d) => setEntries(d.entries))
  }, [tab])
  return (
    <main className="page">
      <div className="hero-block">
        <h1>Library</h1>
      </div>
      <div className="chips">
        {["WATCHED", "WATCHING", "WANT"].map((s) => (
          <button key={s} className="chip" aria-selected={tab === s} onClick={() => setTab(s)}>
            {s === "WATCHED" ? "Watched" : s === "WATCHING" ? "Watching" : "Want"}
          </button>
        ))}
      </div>
      <PosterGrid titles={entries.map((e) => e.title)} />
    </main>
  )
}

export function ListsPage() {
  const { user } = useAuth()
  const listPath = user?.username ? `/users/${user.username}/lists` : ""
  const [lists, setLists] = useState<{ name: string; slug: string; itemCount: number; posters: (string | null)[] }[]>(
    () => (listPath ? peek<{ lists: { name: string; slug: string; itemCount: number; posters: (string | null)[] }[] }>(listPath)?.lists ?? [] : [])
  )
  const load = () => {
    if (!user?.username) return
    api<{ lists: typeof lists }>(`/users/${user.username}/lists`).then((d) => setLists(d.lists))
  }
  useEffect(() => {
    load()
  }, [user?.username])
  const presets = ["Favorites", "Rewatch", "Comfort", "With friends"]
  async function createNamed(name: string) {
    await api("/lists", { method: "POST", body: JSON.stringify({ name }) })
    load()
  }
  return (
    <main className="page">
      <div className="hero-block">
        <h1>Lists</h1>
      </div>
      <div className="chips">
        {presets.map((n) => (
          <button key={n} className="chip" onClick={() => createNamed(n)}>
            + {n}
          </button>
        ))}
      </div>
      {lists.map((l) => (
        <Link key={l.slug} className="list-tile" to={`/u/${user?.username}/list/${l.slug}`}>
          <div className="thumbs">
            {l.posters.filter(Boolean).map((p, i) => (
              <img key={i} src={p!} alt="" />
            ))}
          </div>
          <div>
            <strong>{l.name}</strong>
            <p className="muted">{l.itemCount} titles</p>
          </div>
        </Link>
      ))}
    </main>
  )
}

export function ListDetail() {
  const { username = "", slug = "" } = useParams()
  const [list, setList] = useState<{ name: string; description?: string | null; items: { title: Title }[] } | null>(null)
  useEffect(() => {
    api<{ list: NonNullable<typeof list> }>(`/lists/${username}/${slug}`).then((d) => setList(d.list))
  }, [username, slug])
  if (!list) return <main className="page">Loading…</main>
  return (
    <main className="page">
      <p className="muted">
        <Link to={`/u/${username}`}>@{username}</Link>
      </p>
      <h1>{list.name}</h1>
      <p className="lede">{list.description}</p>
      <PosterGrid titles={list.items.map((i) => i.title)} />
    </main>
  )
}

export function Profile() {
  const { username = "" } = useParams()
  const { user, logout } = useAuth()
  const [data, setData] = useState<null | {
    user: User
    stats: { titles: number; lists: number; reviews: number; hours: number }
    recently: { title: Title }[]
    lists: { name: string; slug: string; itemCount: number }[]
  }>(null)
  useEffect(() => {
    api<NonNullable<typeof data>>(`/users/${username}`).then(setData)
  }, [username])
  if (!data) return <main className="page">Loading…</main>
  const mine = user?.username === username
  return (
    <main className="page">
      <h1>{data.user.name}</h1>
      <p className="muted">@{data.user.username}</p>
      <p>{data.user.bio}</p>
      <div className="stat-row">
        <div className="stat">
          <b>{data.stats.titles}</b> watched
        </div>
        <div className="stat">
          <b>{data.stats.lists}</b> lists
        </div>
        <div className="stat">
          <b>{data.stats.reviews}</b> reviews
        </div>
        <div className="stat">
          <b>{data.stats.hours}</b> hrs
        </div>
      </div>
      {mine ? (
        <div className="row">
          <Link className="btn ghost" to="/stats">
            Stats
          </Link>
          <button className="btn ghost" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      ) : (
        <button
          className="btn"
          onClick={() => api("/friends/request", { method: "POST", body: JSON.stringify({ username }) })}
        >
          Add friend
        </button>
      )}
      <h2>Recently</h2>
      <PosterGrid titles={data.recently.map((r) => r.title)} />
      <h2>Lists</h2>
      {data.lists.map((l) => (
        <p key={l.slug}>
          <Link to={`/u/${username}/list/${l.slug}`}>
            {l.name} ({l.itemCount})
          </Link>
        </p>
      ))}
    </main>
  )
}

export function Friends() {
  const [q, setQ] = useState("")
  const [found, setFound] = useState<User[]>([])
  const [pack, setPack] = useState<{ friends: User[]; incoming: { id: string; user: User }[] }>({
    friends: [],
    incoming: [],
  })
  const load = () => api<typeof pack>("/friends").then(setPack)
  useEffect(() => {
    void load()
  }, [])
  useEffect(() => {
    if (q.length < 2) return
    api<{ users: User[] }>(`/users/search?q=${encodeURIComponent(q)}`).then((d) => setFound(d.users))
  }, [q])
  return (
    <main className="page">
      <h1>Friends</h1>
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find username" />
      {found.map((u) => (
        <div key={u.id} className="list-card">
          <Link to={`/u/${u.username}`}>@{u.username}</Link>
          <button
            className="btn ghost"
            onClick={() => api("/friends/request", { method: "POST", body: JSON.stringify({ username: u.username }) })}
          >
            Request
          </button>
        </div>
      ))}
      <h2>Incoming</h2>
      {pack.incoming.map((r) => (
        <div key={r.id} className="row">
          <Link to={`/u/${r.user.username}`}>@{r.user.username}</Link>
          <button
            className="btn"
            onClick={async () => {
              await api("/friends/respond", { method: "POST", body: JSON.stringify({ requestId: r.id, accept: true }) })
              await load()
            }}
          >
            Accept
          </button>
        </div>
      ))}
      <h2>Your people</h2>
      {pack.friends.map((f) => (
        <p key={f.id}>
          <Link to={`/u/${f.username}`}>@{f.username}</Link>
        </p>
      ))}
    </main>
  )
}

export function Activity() {
  const [events, setEvents] = useState<{ id: string; type: string; payload: Record<string, string>; actor: User }[]>(
    () => peek<{ events: { id: string; type: string; payload: Record<string, string>; actor: User }[] }>("/activity")?.events ?? []
  )
  useEffect(() => {
    api<{ events: typeof events }>("/activity").then((d) => setEvents(d.events))
  }, [])
  return (
    <main className="page">
      <h1>Activity</h1>
      <div className="feed">
        {events.map((e) => (
          <article key={e.id}>
            <Link to={`/u/${e.actor.username}`}>@{e.actor.username}</Link> {e.type.toLowerCase()}{" "}
            {e.payload.title ?? e.payload.name ?? ""}
          </article>
        ))}
      </div>
    </main>
  )
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState<{ id: string; body: string; user: User; title: Title }[]>([])
  useEffect(() => {
    api<{ reviews: typeof reviews }>("/reviews").then((d) => setReviews(d.reviews))
  }, [])
  return (
    <main className="page">
      <h1>Reviews</h1>
      {reviews.map((r) => (
        <article key={r.id} className="card" style={{ marginBottom: 12 }}>
          <Link to={`/title/${r.title.mediaType}/${r.title.tmdbId}`}>{r.title.title}</Link>
          <p>
            <Link to={`/u/${r.user.username}`}>@{r.user.username}</Link>
          </p>
          <p>{r.body}</p>
        </article>
      ))}
    </main>
  )
}

export function Inbox() {
  const [items, setItems] = useState<{ id: string; message: string; sender: User; title: Title }[]>([])
  const load = () => api<{ items: typeof items }>("/inbox").then((d) => setItems(d.items))
  useEffect(() => {
    void load()
  }, [])
  return (
    <main className="page">
      <h1>Inbox</h1>
      {items.map((i) => (
        <div key={i.id} className="card" style={{ marginBottom: 12 }}>
          <p>
            {i.sender.username} on {i.title.title}
          </p>
          <p>{i.message}</p>
          <button
            className="btn"
            onClick={async () => {
              await api(`/inbox/${i.id}/accept`, { method: "POST" })
              await load()
            }}
          >
            Add to Want
          </button>
        </div>
      ))}
    </main>
  )
}

export function StatsPage() {
  const [s, setS] = useState<Record<string, number> | null>(null)
  useEffect(() => {
    api<Record<string, number>>("/me/stats").then(setS)
  }, [])
  if (!s) return <main className="page">Loading…</main>
  return (
    <main className="page">
      <h1>Stats</h1>
      <div className="stat-row">
        {Object.entries(s)
          .filter(([, v]) => typeof v === "number")
          .map(([k, v]) => (
            <div className="stat" key={k}>
              <b>{v}</b> {k}
            </div>
          ))}
      </div>
    </main>
  )
}

export function CollectionsPage() {
  const [cols, setCols] = useState<{ slug: string; name: string; description: string; titles: Title[] }[]>(
    () => peek<{ collections: { slug: string; name: string; description: string; titles: Title[] }[] }>("/collections")?.collections ?? []
  )
  useEffect(() => {
    api<{ collections: typeof cols }>("/collections").then((d) => setCols(d.collections))
  }, [])
  return (
    <main className="page">
      <div className="hero-block">
        <h1>Collections</h1>
      </div>
      {cols.map((c) => (
        <PosterRail key={c.slug} label={c.name} titles={c.titles} />
      ))}
    </main>
  )
}

export function HistoryPage() {
  const [logs, setLogs] = useState<{ id: string; watchedAt: string; title: Title }[]>([])
  useEffect(() => {
    api<{ logs: typeof logs }>("/me/history").then((d) => setLogs(d.logs))
  }, [])
  return (
    <main className="page">
      <h1>Watch log</h1>
      {logs.map((l) => (
        <p key={l.id}>
          {new Date(l.watchedAt).toLocaleDateString()} — {l.title.title}
        </p>
      ))}
    </main>
  )
}
