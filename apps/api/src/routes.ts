import { Router } from "express"
import bcrypt from "bcryptjs"
import { randomBytes } from "node:crypto"
import { z } from "zod"
import { db } from "./db.js"
import { env } from "./env.js"
import { COOKIE, fail, requireAuth, type AuthedRequest } from "./http.js"
import {
  RESERVED,
  USERNAME_RE,
  createSession,
  logActivity,
  notify,
  slugify,
} from "./domain.js"
import { browseTmdb, catalogTmdb, LANGUAGES, searchPeople, searchTmdb, tmdbGenres, toClientTitle, watchProviders, type MediaType } from "./tmdb.js"
import { memo } from "./cache.js"
import { getOrFetchTitle, publicTitle } from "./titles.js"

export const router = Router()

function userPublic(u: {
  id: string
  username: string | null
  name: string | null
  image: string | null
  bio?: string | null
}) {
  return { id: u.id, username: u.username, name: u.name, image: u.image, bio: u.bio ?? null }
}

function setCookie(res: import("express").Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !env.isDev,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    path: "/",
  })
}

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  username: z.string().trim().toLowerCase(),
})

router.post("/auth/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) return fail(res, 400, parsed.error.issues[0]?.message ?? "Invalid", "VALIDATION")
  const { name, email, password, username } = parsed.data
  if (!USERNAME_RE.test(username)) return fail(res, 400, "Username: 3–20 letters, numbers, underscore", "VALIDATION")
  if (RESERVED.has(username)) return fail(res, 400, "That username is reserved", "USERNAME_RESERVED")
  const taken = await db.user.findFirst({ where: { OR: [{ email }, { username }] } })
  if (taken?.email === email) return fail(res, 409, "Email already registered", "EMAIL_TAKEN")
  if (taken?.username === username) return fail(res, 409, "Username taken", "USERNAME_TAKEN")
  const passwordHash = await bcrypt.hash(password, 12)
  const autoVerify = env.isDev
  const user = await db.user.create({
    data: {
      name,
      email,
      username,
      passwordHash,
      emailVerified: autoVerify ? new Date() : null,
    },
  })
  if (!autoVerify) {
    const token = randomBytes(32).toString("hex")
    await db.verificationToken.create({
      data: { identifier: email, token, expires: new Date(Date.now() + 86400000) },
    })
    res.json({ ok: true, autoVerified: false, user: userPublic(user) })
    return
  }
  const sessionToken = await createSession(user.id)
  setCookie(res, sessionToken)
  res.json({ ok: true, autoVerified: true, accessToken: sessionToken, user: userPublic(user) })
})

router.post("/auth/login", async (req, res) => {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body)
  if (!parsed.success) return fail(res, 400, "Invalid email or password", "VALIDATION")
  const user = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (!user?.passwordHash) return fail(res, 401, "Invalid email or password", "INVALID_CREDENTIALS")
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!ok) return fail(res, 401, "Invalid email or password", "INVALID_CREDENTIALS")
  if (!user.emailVerified) return fail(res, 403, "Verify your email first", "UNVERIFIED")
  if (!user.username) return fail(res, 403, "Choose a username", "USERNAME_REQUIRED")
  const token = await createSession(user.id)
  setCookie(res, token)
  res.json({ ok: true, accessToken: token, user: userPublic(user) })
})

router.post("/auth/logout", async (req, res) => {
  const token = req.cookies?.[COOKIE]
  if (token) await db.session.deleteMany({ where: { sessionToken: token } })
  res.clearCookie(COOKIE, { path: "/" })
  res.json({ ok: true })
})

router.get("/auth/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await db.user.findUnique({ where: { id: req.userId! } })
  if (!user) return fail(res, 401, "Gone", "AUTH_REQUIRED")
  res.json({ user: userPublic(user) })
})

router.get("/auth/verify-email", async (req, res) => {
  const token = String(req.query.token ?? "")
  const row = await db.verificationToken.findUnique({ where: { token } })
  if (!row) return fail(res, 400, "Invalid link", "INVALID_TOKEN")
  if (row.expires < new Date()) return fail(res, 400, "Link expired", "EXPIRED_TOKEN")
  await db.user.update({ where: { email: row.identifier }, data: { emailVerified: new Date() } })
  await db.verificationToken.delete({ where: { token } })
  res.json({ ok: true })
})

router.get("/titles/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim()
  if (q.length < 2) return res.json({ results: [] })
  try {
    const results = await searchTmdb(q)
    res.json({ results: results.map(toClientTitle) })
  } catch (e) {
    fail(res, 502, e instanceof Error ? e.message : "TMDB error", "TMDB")
  }
})

router.get("/discover", async (_req, res) => {
  try {
    const payload = await memo("discover:rails", 1000 * 60 * 10, async () => {
      const [trending, popularMovies, topRated, nowPlaying, upcoming, popularTv] = await Promise.all([
        catalogTmdb("/trending/all/week", "MOVIE"),
        catalogTmdb("/movie/popular", "MOVIE"),
        catalogTmdb("/movie/top_rated", "MOVIE"),
        catalogTmdb("/movie/now_playing", "MOVIE"),
        catalogTmdb("/movie/upcoming", "MOVIE"),
        catalogTmdb("/tv/popular", "TV"),
      ])
      return {
        rails: [
          { id: "trending", label: "This week", kind: "all", titles: trending.map(toClientTitle) },
          { id: "now", label: "In theatres", kind: "movie", titles: nowPlaying.map(toClientTitle) },
          { id: "upcoming", label: "Coming soon", kind: "movie", titles: upcoming.map(toClientTitle) },
          { id: "popular-movies", label: "Popular movies", kind: "movie", titles: popularMovies.map(toClientTitle) },
          { id: "top", label: "Top rated", kind: "movie", titles: topRated.map(toClientTitle) },
          { id: "popular-tv", label: "Popular series", kind: "tv", titles: popularTv.map(toClientTitle) },
        ],
      }
    })
    res.json(payload)
  } catch (e) {
    fail(res, 502, e instanceof Error ? e.message : "TMDB error", "TMDB")
  }
})

router.get("/discover/meta", async (_req, res) => {
  try {
    const genres = await tmdbGenres()
    res.json({ genres, languages: LANGUAGES })
  } catch (e) {
    fail(res, 502, e instanceof Error ? e.message : "TMDB error", "TMDB")
  }
})

router.get("/discover/people", async (req, res) => {
  const q = String(req.query.q ?? "").trim()
  const role = String(req.query.role ?? "actor")
  if (q.length < 2) return res.json({ people: [] })
  if (role !== "actor" && role !== "actress" && role !== "director") {
    return fail(res, 400, "Bad role", "VALIDATION")
  }
  try {
    res.json({ people: await searchPeople(q, role) })
  } catch (e) {
    fail(res, 502, e instanceof Error ? e.message : "TMDB error", "TMDB")
  }
})

router.get("/discover/browse", async (req, res) => {
  const kind = String(req.query.kind ?? "movie") === "tv" ? "tv" : "movie"
  const year = String(req.query.year ?? "") || undefined
  const genre = String(req.query.genre ?? "") || undefined
  const language = String(req.query.language ?? "") || undefined
  const person = String(req.query.person ?? "") || undefined
  const credit = String(req.query.credit ?? "cast") === "crew" ? "crew" : "cast"
  try {
    const titles = await browseTmdb({ kind, year, genre, language, person, credit })
    res.json({ titles: titles.map(toClientTitle) })
  } catch (e) {
    fail(res, 502, e instanceof Error ? e.message : "TMDB error", "TMDB")
  }
})

router.get("/titles/:mediaType/:tmdbId", optional(async (req: AuthedRequest, res) => {
  const mediaType = req.params.mediaType.toUpperCase() === "TV" ? "TV" : "MOVIE"
  const tmdbId = Number(req.params.tmdbId)
  if (!Number.isFinite(tmdbId)) return fail(res, 400, "Bad id", "VALIDATION")
  const [title, providers] = await Promise.all([
    getOrFetchTitle(tmdbId, mediaType as MediaType),
    watchProviders(tmdbId, mediaType as MediaType).catch(() => []),
  ])
  const [reviews, library, lists] = await Promise.all([
    db.review.findMany({ where: { titleId: title.id }, include: { user: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    req.userId
      ? db.libraryEntry.findUnique({ where: { userId_titleId: { userId: req.userId, titleId: title.id } } })
      : null,
    req.userId ? db.list.findMany({ where: { userId: req.userId }, select: { id: true, name: true, slug: true } }) : [],
  ])
  const friends = req.userId
    ? await db.friendship.findMany({ where: { userId: req.userId }, select: { friendId: true } })
    : []
  const friendIds = friends.map((f) => f.friendId)
  const friendLib = friendIds.length
    ? await db.libraryEntry.findMany({
        where: { titleId: title.id, userId: { in: friendIds } },
        include: { user: true },
      })
    : []
  res.json({
    title: publicTitle(title),
    providers,
    mine: library,
    myLists: lists,
    reviews: reviews.map((r) => ({
      id: r.id,
      body: r.body,
      rating: r.rating,
      createdAt: r.createdAt,
      user: userPublic(r.user),
    })),
    friendStatuses: friendLib.map((e) => ({ user: userPublic(e.user), status: e.status, rating: e.rating })),
  })
}))

function optional(fn: (req: AuthedRequest, res: import("express").Response) => Promise<void>) {
  return async (req: AuthedRequest, res: import("express").Response, next: import("express").NextFunction) => {
    try {
      await fn(req, res)
    } catch (e) {
      next(e)
    }
  }
}

router.put("/library/:mediaType/:tmdbId", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      status: z.enum(["WANT", "WATCHING", "WATCHED"]),
      rating: z.number().int().min(1).max(10).nullable().optional(),
      note: z.string().max(500).nullable().optional(),
    })
    .safeParse(req.body)
  if (!parsed.success) return fail(res, 400, "Invalid", "VALIDATION")
  const mediaType = req.params.mediaType.toUpperCase() === "TV" ? "TV" : "MOVIE"
  const title = await getOrFetchTitle(Number(req.params.tmdbId), mediaType as MediaType)
  const entry = await db.libraryEntry.upsert({
    where: { userId_titleId: { userId: req.userId!, titleId: title.id } },
    create: {
      userId: req.userId!,
      titleId: title.id,
      status: parsed.data.status,
      rating: parsed.data.rating ?? null,
      note: parsed.data.note ?? null,
    },
    update: {
      status: parsed.data.status,
      rating: parsed.data.rating === undefined ? undefined : parsed.data.rating,
      note: parsed.data.note === undefined ? undefined : parsed.data.note,
    },
  })
  if (parsed.data.status === "WATCHED") {
    await db.watchLog.create({ data: { userId: req.userId!, titleId: title.id } })
    await logActivity(req.userId!, "WATCHED", { titleId: title.id, title: title.title })
  }
  res.json({ entry })
})

router.get("/me/library", requireAuth, async (req: AuthedRequest, res) => {
  const status = req.query.status as string | undefined
  const entries = await db.libraryEntry.findMany({
    where: { userId: req.userId!, ...(status ? { status: status as never } : {}) },
    include: { title: true },
    orderBy: { updatedAt: "desc" },
  })
  res.json({ entries: entries.map((e) => ({ ...e, title: publicTitle(e.title) })) })
})

router.get("/me/history", requireAuth, async (req: AuthedRequest, res) => {
  const logs = await db.watchLog.findMany({
    where: { userId: req.userId! },
    include: { title: true },
    orderBy: { watchedAt: "desc" },
    take: 50,
  })
  res.json({ logs: logs.map((l) => ({ ...l, title: publicTitle(l.title) })) })
})

router.post("/lists", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z.object({ name: z.string().trim().min(1).max(80), description: z.string().max(500).optional() }).safeParse(req.body)
  if (!parsed.success) return fail(res, 400, "Name required", "VALIDATION")
  let slug = slugify(parsed.data.name)
  const clash = await db.list.findUnique({ where: { userId_slug: { userId: req.userId!, slug } } })
  if (clash) slug = `${slug}-${randomBytes(2).toString("hex")}`
  const list = await db.list.create({
    data: { userId: req.userId!, name: parsed.data.name, slug, description: parsed.data.description },
  })
  await logActivity(req.userId!, "LIST_CREATE", { listId: list.id, name: list.name })
  res.json({ list })
})

router.get("/lists/:username/:slug", async (req, res) => {
  const user = await db.user.findUnique({ where: { username: req.params.username } })
  if (!user) return fail(res, 404, "Not found", "NOT_FOUND")
  const list = await db.list.findUnique({
    where: { userId_slug: { userId: user.id, slug: req.params.slug } },
    include: { items: { include: { title: true }, orderBy: { addedAt: "desc" } }, user: true },
  })
  if (!list) return fail(res, 404, "Not found", "NOT_FOUND")
  res.json({
    list: {
      ...list,
      items: list.items.map((i) => ({ ...i, title: publicTitle(i.title) })),
      user: userPublic(list.user),
    },
  })
})

router.get("/users/:username/lists", async (req, res) => {
  const user = await db.user.findUnique({ where: { username: req.params.username } })
  if (!user) return fail(res, 404, "Not found", "NOT_FOUND")
  const lists = await db.list.findMany({
    where: { userId: user.id },
    include: { _count: { select: { items: true } }, items: { take: 4, include: { title: true } } },
    orderBy: { createdAt: "desc" },
  })
  res.json({
    lists: lists.map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      description: l.description,
      itemCount: l._count.items,
      posters: l.items.map((i) => publicTitle(i.title).posterUrl),
    })),
  })
})

router.post("/lists/:id/items", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z.object({ tmdbId: z.number(), mediaType: z.enum(["MOVIE", "TV"]) }).safeParse(req.body)
  if (!parsed.success) return fail(res, 400, "Invalid", "VALIDATION")
  const list = await db.list.findFirst({ where: { id: req.params.id, userId: req.userId! } })
  if (!list) return fail(res, 404, "Not found", "NOT_FOUND")
  const title = await getOrFetchTitle(parsed.data.tmdbId, parsed.data.mediaType)
  const item = await db.listItem.upsert({
    where: { listId_titleId: { listId: list.id, titleId: title.id } },
    create: { listId: list.id, titleId: title.id, userId: req.userId! },
    update: {},
  })
  await logActivity(req.userId!, "LIST_ADD", { listId: list.id, title: title.title })
  res.json({ item })
})

router.post("/reviews", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      tmdbId: z.number(),
      mediaType: z.enum(["MOVIE", "TV"]),
      body: z.string().trim().min(10).max(4000),
      rating: z.number().int().min(1).max(10).optional(),
    })
    .safeParse(req.body)
  if (!parsed.success) return fail(res, 400, "Review needs at least 10 characters", "VALIDATION")
  const title = await getOrFetchTitle(parsed.data.tmdbId, parsed.data.mediaType)
  const review = await db.review.upsert({
    where: { userId_titleId: { userId: req.userId!, titleId: title.id } },
    create: { userId: req.userId!, titleId: title.id, body: parsed.data.body, rating: parsed.data.rating },
    update: { body: parsed.data.body, rating: parsed.data.rating },
  })
  await logActivity(req.userId!, "REVIEW", { titleId: title.id, title: title.title })
  res.json({ review })
})

router.get("/reviews", async (_req, res) => {
  const reviews = await db.review.findMany({
    include: { user: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  })
  res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      body: r.body,
      rating: r.rating,
      createdAt: r.createdAt,
      user: userPublic(r.user),
      title: publicTitle(r.title),
    })),
  })
})

router.get("/users/search", requireAuth, async (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase()
  if (q.length < 2) return res.json({ users: [] })
  const users = await db.user.findMany({
    where: { username: { contains: q, mode: "insensitive" } },
    take: 20,
  })
  res.json({ users: users.map(userPublic) })
})

router.post("/friends/request", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z.object({ username: z.string() }).safeParse(req.body)
  if (!parsed.success) return fail(res, 400, "Username required", "VALIDATION")
  const other = await db.user.findUnique({ where: { username: parsed.data.username.toLowerCase() } })
  if (!other) return fail(res, 404, "User not found", "NOT_FOUND")
  if (other.id === req.userId) return fail(res, 400, "That is you", "VALIDATION")
  const fr = await db.friendRequest.upsert({
    where: { requesterId_recipientId: { requesterId: req.userId!, recipientId: other.id } },
    create: { requesterId: req.userId!, recipientId: other.id },
    update: { status: "PENDING" },
  })
  await notify(other.id, "New friend request")
  res.json({ request: fr })
})

router.post("/friends/respond", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z.object({ requestId: z.string(), accept: z.boolean() }).safeParse(req.body)
  if (!parsed.success) return fail(res, 400, "Invalid", "VALIDATION")
  const fr = await db.friendRequest.findFirst({
    where: { id: parsed.data.requestId, recipientId: req.userId! },
  })
  if (!fr) return fail(res, 404, "Not found", "NOT_FOUND")
  if (!parsed.data.accept) {
    await db.friendRequest.update({ where: { id: fr.id }, data: { status: "DECLINED" } })
    return res.json({ ok: true })
  }
  await db.$transaction([
    db.friendRequest.update({ where: { id: fr.id }, data: { status: "ACCEPTED" } }),
    db.friendship.upsert({
      where: { userId_friendId: { userId: req.userId!, friendId: fr.requesterId } },
      create: { userId: req.userId!, friendId: fr.requesterId },
      update: {},
    }),
    db.friendship.upsert({
      where: { userId_friendId: { userId: fr.requesterId, friendId: req.userId! } },
      create: { userId: fr.requesterId, friendId: req.userId! },
      update: {},
    }),
  ])
  await logActivity(req.userId!, "FRIEND", { friendId: fr.requesterId })
  res.json({ ok: true })
})

router.get("/friends", requireAuth, async (req: AuthedRequest, res) => {
  const [friends, incoming] = await Promise.all([
    db.friendship.findMany({ where: { userId: req.userId! }, include: { friend: true } }),
    db.friendRequest.findMany({
      where: { recipientId: req.userId!, status: "PENDING" },
      include: { requester: true },
    }),
  ])
  res.json({
    friends: friends.map((f) => userPublic(f.friend)),
    incoming: incoming.map((r) => ({ id: r.id, user: userPublic(r.requester) })),
  })
})

router.post("/recommend", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      username: z.string(),
      tmdbId: z.number(),
      mediaType: z.enum(["MOVIE", "TV"]),
      message: z.string().trim().min(1).max(1000),
    })
    .safeParse(req.body)
  if (!parsed.success) return fail(res, 400, "Message required", "VALIDATION")
  const other = await db.user.findUnique({ where: { username: parsed.data.username.toLowerCase() } })
  if (!other) return fail(res, 404, "User not found", "NOT_FOUND")
  const bond = await db.friendship.findUnique({
    where: { userId_friendId: { userId: req.userId!, friendId: other.id } },
  })
  if (!bond) return fail(res, 403, "Friends only", "NOT_FRIENDS")
  const title = await getOrFetchTitle(parsed.data.tmdbId, parsed.data.mediaType)
  const suggestion = await db.suggestion.create({
    data: {
      senderId: req.userId!,
      recipientId: other.id,
      titleId: title.id,
      message: parsed.data.message,
    },
  })
  await logActivity(req.userId!, "RECOMMEND", { title: title.title, to: other.username })
  await notify(other.id, `Recommended: ${title.title}`)
  res.json({ suggestion })
})

router.get("/inbox", requireAuth, async (req: AuthedRequest, res) => {
  const items = await db.suggestion.findMany({
    where: { recipientId: req.userId! },
    include: { sender: true, title: true },
    orderBy: { createdAt: "desc" },
  })
  res.json({
    items: items.map((s) => ({
      id: s.id,
      message: s.message,
      status: s.status,
      sender: userPublic(s.sender),
      title: publicTitle(s.title),
    })),
  })
})

router.post("/inbox/:id/accept", requireAuth, async (req: AuthedRequest, res) => {
  const s = await db.suggestion.findFirst({ where: { id: req.params.id, recipientId: req.userId! } })
  if (!s) return fail(res, 404, "Not found", "NOT_FOUND")
  await db.suggestion.update({ where: { id: s.id }, data: { status: "ACCEPTED" } })
  await db.libraryEntry.upsert({
    where: { userId_titleId: { userId: req.userId!, titleId: s.titleId } },
    create: { userId: req.userId!, titleId: s.titleId, status: "WANT" },
    update: {},
  })
  res.json({ ok: true })
})

router.get("/activity", requireAuth, async (req: AuthedRequest, res) => {
  const friends = await db.friendship.findMany({ where: { userId: req.userId! } })
  const ids = [req.userId!, ...friends.map((f) => f.friendId)]
  const events = await db.activityEvent.findMany({
    where: { actorId: { in: ids } },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  res.json({
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      payload: e.payload,
      createdAt: e.createdAt,
      actor: userPublic(e.actor),
    })),
  })
})

router.get("/users/:username", async (req, res) => {
  const user = await db.user.findUnique({ where: { username: req.params.username } })
  if (!user) return fail(res, 404, "Not found", "NOT_FOUND")
  const [library, lists, reviews, logs] = await Promise.all([
    db.libraryEntry.findMany({ where: { userId: user.id }, include: { title: true }, take: 24, orderBy: { updatedAt: "desc" } }),
    db.list.findMany({ where: { userId: user.id }, include: { _count: { select: { items: true } } } }),
    db.review.count({ where: { userId: user.id } }),
    db.watchLog.findMany({ where: { userId: user.id } }),
  ])
  const hours = Math.round(
    logs.reduce((acc, _l, i) => acc + (library[i]?.title.runtime ?? 100), 0) / 60
  )
  res.json({
    user: userPublic(user),
    stats: {
      titles: library.filter((e) => e.status === "WATCHED").length,
      lists: lists.length,
      reviews,
      watchLogs: logs.length,
      hours,
    },
    recently: library.map((e) => ({ status: e.status, rating: e.rating, title: publicTitle(e.title) })),
    lists: lists.map((l) => ({ name: l.name, slug: l.slug, itemCount: l._count.items })),
  })
})

router.get("/me/stats", requireAuth, async (req: AuthedRequest, res) => {
  const [entries, logs, reviews, lists] = await Promise.all([
    db.libraryEntry.findMany({ where: { userId: req.userId! }, include: { title: true } }),
    db.watchLog.findMany({ where: { userId: req.userId! }, include: { title: true } }),
    db.review.count({ where: { userId: req.userId! } }),
    db.list.count({ where: { userId: req.userId! } }),
  ])
  const minutes = entries.reduce((a, e) => a + (e.title.runtime ?? 0), 0)
  res.json({
    watched: entries.filter((e) => e.status === "WATCHED").length,
    watching: entries.filter((e) => e.status === "WATCHING").length,
    want: entries.filter((e) => e.status === "WANT").length,
    reviews,
    lists,
    logs: logs.length,
    hours: Math.round(minutes / 60),
    byType: {
      movies: entries.filter((e) => e.title.mediaType === "MOVIE").length,
      shows: entries.filter((e) => e.title.mediaType === "TV").length,
    },
  })
})

router.get("/collections", async (_req, res) => {
  const payload = await memo("collections:all", 1000 * 60 * 5, async () => {
    const cols = await db.collection.findMany({
      include: { items: { include: { title: true }, orderBy: { sortOrder: "asc" } } },
    })
    return {
      collections: cols.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        titles: c.items.map((i) => publicTitle(i.title)),
      })),
    }
  })
  res.json(payload)
})

router.get("/me/lists", requireAuth, async (req: AuthedRequest, res) => {
  const lists = await db.list.findMany({
    where: { userId: req.userId! },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  })
  res.json({ lists: lists.map((l) => ({ id: l.id, name: l.name, slug: l.slug, itemCount: l._count.items })) })
})

router.get("/notifications", requireAuth, async (req: AuthedRequest, res) => {
  const notes = await db.notification.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  res.json({ notifications: notes })
})

router.post("/notifications/read", requireAuth, async (req: AuthedRequest, res) => {
  await db.notification.updateMany({ where: { userId: req.userId! }, data: { read: true } })
  res.json({ ok: true })
})

