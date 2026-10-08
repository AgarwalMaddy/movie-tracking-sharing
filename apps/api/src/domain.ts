import { randomBytes } from "node:crypto"
import { db } from "./db.js"
import { getOrFetchTitle, upsertTitle } from "./titles.js"
import { forget } from "./cache.js"
import type { ActivityType } from "@prisma/client"

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/
export const RESERVED = new Set([
  "login", "signup", "logout", "settings", "home", "discover", "titles", "reviews",
  "lists", "collections", "friends", "users", "api", "onboarding", "verify-email",
  "auth", "admin", "www", "search", "activity",
])

export function slugify(name: string) {
  const s = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return s.slice(0, 40) || "list"
}

export async function createSession(userId: string) {
  const sessionToken = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  await db.session.create({ data: { sessionToken, userId, expires } })
  return sessionToken
}

export async function logActivity(actorId: string, type: ActivityType, payload: object) {
  await db.activityEvent.create({ data: { actorId, type, payload } })
}

export async function notify(userId: string, body: string) {
  await db.notification.create({ data: { userId, body } })
}

const PACKS = [
  {
    slug: "dark-knight",
    name: "The Dark Knight trilogy",
    description: "Nolan's Batman films.",
    titles: [
      { tmdbId: 272, mediaType: "MOVIE" as const },
      { tmdbId: 155, mediaType: "MOVIE" as const },
      { tmdbId: 49026, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "star-wars-saga",
    name: "Skywalker saga",
    description: "A New Hope through Jedi.",
    titles: [
      { tmdbId: 11, mediaType: "MOVIE" as const },
      { tmdbId: 1891, mediaType: "MOVIE" as const },
      { tmdbId: 1892, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "middle-earth",
    name: "The Lord of the Rings",
    description: "Jackson's original trilogy.",
    titles: [
      { tmdbId: 120, mediaType: "MOVIE" as const },
      { tmdbId: 121, mediaType: "MOVIE" as const },
      { tmdbId: 122, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "wizarding-world",
    name: "Harry Potter",
    description: "The first three films.",
    titles: [
      { tmdbId: 671, mediaType: "MOVIE" as const },
      { tmdbId: 672, mediaType: "MOVIE" as const },
      { tmdbId: 673, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "pixar-classics",
    name: "Pixar classics",
    description: "Toy Story, Finding Nemo, Up.",
    titles: [
      { tmdbId: 862, mediaType: "MOVIE" as const },
      { tmdbId: 12, mediaType: "MOVIE" as const },
      { tmdbId: 14160, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "ghibli-essentials",
    name: "Ghibli essentials",
    description: "Spirited Away, Totoro, Howl.",
    titles: [
      { tmdbId: 129, mediaType: "MOVIE" as const },
      { tmdbId: 8392, mediaType: "MOVIE" as const },
      { tmdbId: 4935, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "john-wick",
    name: "John Wick",
    description: "The first three hits.",
    titles: [
      { tmdbId: 245891, mediaType: "MOVIE" as const },
      { tmdbId: 324552, mediaType: "MOVIE" as const },
      { tmdbId: 458156, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "mcu-landmarks",
    name: "MCU landmarks",
    description: "Iron Man, The Avengers, Endgame.",
    titles: [
      { tmdbId: 1726, mediaType: "MOVIE" as const },
      { tmdbId: 24428, mediaType: "MOVIE" as const },
      { tmdbId: 299534, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "godfather",
    name: "The Godfather",
    description: "Coppola's Corleone trilogy.",
    titles: [
      { tmdbId: 238, mediaType: "MOVIE" as const },
      { tmdbId: 240, mediaType: "MOVIE" as const },
      { tmdbId: 242, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "the-matrix",
    name: "The Matrix",
    description: "The original trilogy.",
    titles: [
      { tmdbId: 603, mediaType: "MOVIE" as const },
      { tmdbId: 604, mediaType: "MOVIE" as const },
      { tmdbId: 605, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "back-to-the-future",
    name: "Back to the Future",
    description: "Hill Valley, three times over.",
    titles: [
      { tmdbId: 105, mediaType: "MOVIE" as const },
      { tmdbId: 165, mediaType: "MOVIE" as const },
      { tmdbId: 196, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "jurassic-park",
    name: "Jurassic Park",
    description: "The original dinosaur trilogy.",
    titles: [
      { tmdbId: 329, mediaType: "MOVIE" as const },
      { tmdbId: 330, mediaType: "MOVIE" as const },
      { tmdbId: 331, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "indiana-jones",
    name: "Indiana Jones",
    description: "Raiders through Last Crusade.",
    titles: [
      { tmdbId: 85, mediaType: "MOVIE" as const },
      { tmdbId: 87, mediaType: "MOVIE" as const },
      { tmdbId: 89, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "alien",
    name: "Alien",
    description: "Ripley's first three films.",
    titles: [
      { tmdbId: 348, mediaType: "MOVIE" as const },
      { tmdbId: 679, mediaType: "MOVIE" as const },
      { tmdbId: 807, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "terminator",
    name: "Terminator",
    description: "Kyle Reese to Judgment Day and T3.",
    titles: [
      { tmdbId: 218, mediaType: "MOVIE" as const },
      { tmdbId: 280, mediaType: "MOVIE" as const },
      { tmdbId: 296, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "pirates-caribbean",
    name: "Pirates of the Caribbean",
    description: "The Jack Sparrow trilogy.",
    titles: [
      { tmdbId: 22, mediaType: "MOVIE" as const },
      { tmdbId: 58, mediaType: "MOVIE" as const },
      { tmdbId: 285, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "spiderman-raimi",
    name: "Spider-Man (Raimi)",
    description: "Tobey Maguire's three films.",
    titles: [
      { tmdbId: 557, mediaType: "MOVIE" as const },
      { tmdbId: 558, mediaType: "MOVIE" as const },
      { tmdbId: 559, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "star-wars-prequels",
    name: "Star Wars prequels",
    description: "Phantom Menace through Sith.",
    titles: [
      { tmdbId: 1893, mediaType: "MOVIE" as const },
      { tmdbId: 1894, mediaType: "MOVIE" as const },
      { tmdbId: 1895, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "the-hobbit",
    name: "The Hobbit",
    description: "There and back again, on film.",
    titles: [
      { tmdbId: 49051, mediaType: "MOVIE" as const },
      { tmdbId: 57158, mediaType: "MOVIE" as const },
      { tmdbId: 122917, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "dune",
    name: "Dune",
    description: "Villeneuve's Arrakis films.",
    titles: [
      { tmdbId: 438631, mediaType: "MOVIE" as const },
      { tmdbId: 693134, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "hunger-games",
    name: "The Hunger Games",
    description: "Katniss through Mockingjay.",
    titles: [
      { tmdbId: 70160, mediaType: "MOVIE" as const },
      { tmdbId: 101299, mediaType: "MOVIE" as const },
      { tmdbId: 131631, mediaType: "MOVIE" as const },
      { tmdbId: 131634, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "how-to-train-your-dragon",
    name: "How to Train Your Dragon",
    description: "Hiccup and Toothless.",
    titles: [
      { tmdbId: 10191, mediaType: "MOVIE" as const },
      { tmdbId: 82703, mediaType: "MOVIE" as const },
      { tmdbId: 166428, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "avatar",
    name: "Avatar",
    description: "Pandora, twice so far.",
    titles: [
      { tmdbId: 19995, mediaType: "MOVIE" as const },
      { tmdbId: 76600, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "mad-max",
    name: "Mad Max",
    description: "The road warrior to Fury Road.",
    titles: [
      { tmdbId: 9659, mediaType: "MOVIE" as const },
      { tmdbId: 8810, mediaType: "MOVIE" as const },
      { tmdbId: 76341, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "oceans",
    name: "Ocean's",
    description: "Eleven, Twelve, Thirteen.",
    titles: [
      { tmdbId: 161, mediaType: "MOVIE" as const },
      { tmdbId: 163, mediaType: "MOVIE" as const },
      { tmdbId: 298, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "craig-bond",
    name: "Daniel Craig's Bond",
    description: "Casino Royale, Skyfall, Spectre.",
    titles: [
      { tmdbId: 36557, mediaType: "MOVIE" as const },
      { tmdbId: 37724, mediaType: "MOVIE" as const },
      { tmdbId: 206647, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "mission-impossible",
    name: "Mission: Impossible",
    description: "The first three IMF jobs.",
    titles: [
      { tmdbId: 954, mediaType: "MOVIE" as const },
      { tmdbId: 955, mediaType: "MOVIE" as const },
      { tmdbId: 956, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "rocky",
    name: "Rocky",
    description: "The Italian Stallion's first three.",
    titles: [
      { tmdbId: 1366, mediaType: "MOVIE" as const },
      { tmdbId: 1367, mediaType: "MOVIE" as const },
      { tmdbId: 1368, mediaType: "MOVIE" as const },
    ],
  },
  {
    slug: "planet-of-the-apes-reboot",
    name: "Planet of the Apes (reboot)",
    description: "Rise, Dawn, and War.",
    titles: [
      { tmdbId: 61791, mediaType: "MOVIE" as const },
      { tmdbId: 119450, mediaType: "MOVIE" as const },
      { tmdbId: 281338, mediaType: "MOVIE" as const },
    ],
  },
]

const TITLE_NAMES: Record<number, string> = {
  272: "Batman Begins",
  155: "The Dark Knight",
  49026: "The Dark Knight Rises",
  11: "Star Wars",
  1891: "The Empire Strikes Back",
  1892: "Return of the Jedi",
  120: "The Lord of the Rings: The Fellowship of the Ring",
  121: "The Lord of the Rings: The Two Towers",
  122: "The Lord of the Rings: The Return of the King",
  671: "Harry Potter and the Philosopher's Stone",
  672: "Harry Potter and the Chamber of Secrets",
  673: "Harry Potter and the Prisoner of Azkaban",
  862: "Toy Story",
  12: "Finding Nemo",
  14160: "Up",
  129: "Spirited Away",
  8392: "My Neighbor Totoro",
  4935: "Howl's Moving Castle",
  245891: "John Wick",
  324552: "John Wick: Chapter 2",
  458156: "John Wick: Chapter 3 — Parabellum",
  1726: "Iron Man",
  24428: "The Avengers",
  299534: "Avengers: Endgame",
  238: "The Godfather",
  240: "The Godfather Part II",
  242: "The Godfather Part III",
  603: "The Matrix",
  604: "The Matrix Reloaded",
  605: "The Matrix Revolutions",
  105: "Back to the Future",
  165: "Back to the Future Part II",
  196: "Back to the Future Part III",
  329: "Jurassic Park",
  330: "The Lost World: Jurassic Park",
  331: "Jurassic Park III",
  85: "Raiders of the Lost Ark",
  87: "Indiana Jones and the Temple of Doom",
  89: "Indiana Jones and the Last Crusade",
  348: "Alien",
  679: "Aliens",
  807: "Alien³",
  218: "The Terminator",
  280: "Terminator 2: Judgment Day",
  296: "Terminator 3: Rise of the Machines",
  22: "Pirates of the Caribbean: The Curse of the Black Pearl",
  58: "Pirates of the Caribbean: Dead Man's Chest",
  285: "Pirates of the Caribbean: At World's End",
  557: "Spider-Man",
  558: "Spider-Man 2",
  559: "Spider-Man 3",
  1893: "Star Wars: Episode I — The Phantom Menace",
  1894: "Star Wars: Episode II — Attack of the Clones",
  1895: "Star Wars: Episode III — Revenge of the Sith",
  49051: "The Hobbit: An Unexpected Journey",
  57158: "The Hobbit: The Desolation of Smaug",
  122917: "The Hobbit: The Battle of the Five Armies",
  438631: "Dune",
  693134: "Dune: Part Two",
  70160: "The Hunger Games",
  101299: "The Hunger Games: Catching Fire",
  131631: "The Hunger Games: Mockingjay – Part 1",
  131634: "The Hunger Games: Mockingjay – Part 2",
  10191: "How to Train Your Dragon",
  82703: "How to Train Your Dragon 2",
  166428: "How to Train Your Dragon: The Hidden World",
  19995: "Avatar",
  76600: "Avatar: The Way of Water",
  9659: "Mad Max",
  8810: "Mad Max 2",
  76341: "Mad Max: Fury Road",
  161: "Ocean's Eleven",
  163: "Ocean's Twelve",
  298: "Ocean's Thirteen",
  36557: "Casino Royale",
  37724: "Skyfall",
  206647: "Spectre",
  954: "Mission: Impossible",
  955: "Mission: Impossible II",
  956: "Mission: Impossible III",
  1366: "Rocky",
  1367: "Rocky II",
  1368: "Rocky III",
  61791: "Rise of the Planet of the Apes",
  119450: "Dawn of the Planet of the Apes",
  281338: "War for the Planet of the Apes",
}

async function titleForSeed(tmdbId: number, mediaType: "MOVIE" | "TV") {
  const existing = await db.title.findUnique({
    where: { tmdbId_mediaType: { tmdbId, mediaType } },
  })
  if (existing?.posterPath) return existing
  void getOrFetchTitle(tmdbId, mediaType).catch(() => undefined)
  if (existing) return existing
  return upsertTitle({
    tmdbId,
    mediaType,
    title: TITLE_NAMES[tmdbId] ?? `Title ${tmdbId}`,
    posterPath: null,
    backdropPath: null,
    imdbId: null,
    releaseDate: null,
    overview: null,
    runtime: null,
  })
}

export async function seedCollections() {
  for (const pack of PACKS) {
    let col = await db.collection.findUnique({
      where: { slug: pack.slug },
      include: { items: true },
    })
    if (col && col.items.length >= pack.titles.length) continue
    const titles = await Promise.all(pack.titles.map((t) => titleForSeed(t.tmdbId, t.mediaType)))
    if (!col) {
      col = await db.collection.create({
        data: { slug: pack.slug, name: pack.name, description: pack.description },
        include: { items: true },
      })
    }
    const have = new Set(col.items.map((i) => i.titleId))
    let order = col.items.length
    for (const title of titles) {
      if (have.has(title.id)) continue
      await db.collectionItem.create({
        data: { collectionId: col.id, titleId: title.id, sortOrder: order++ },
      })
    }
    console.log(`seeded ${pack.slug} (${titles.length} titles)`)
  }
  forget("collections:all")
}
