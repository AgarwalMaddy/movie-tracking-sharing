import { describe, it, expect, vi, beforeEach } from "vitest"
import { addToLibrary, getLibrary } from "../actions"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { getTitleDetails } from "@/lib/tmdb"

const mockAuth = vi.mocked(auth)
const mockDb = vi.mocked(db)
const mockGetTitleDetails = vi.mocked(getTitleDetails)

describe("addToLibrary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns UNAUTHORIZED when not logged in", async () => {
    mockAuth.mockResolvedValue(null as any)

    const result = await addToLibrary({
      tmdbId: 27205,
      mediaType: "MOVIE",
      status: "WANT_TO_WATCH",
    })

    expect(result).toEqual({ error: "Not authenticated", code: "UNAUTHORIZED" })
  })

  it("creates title from TMDB and adds to library", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.title.findUnique.mockResolvedValue(null)
    mockGetTitleDetails.mockResolvedValue({
      tmdbId: 27205,
      title: "Inception",
      mediaType: "MOVIE",
      posterPath: "/poster.jpg",
      releaseDate: "2010-07-16",
      overview: "A thief...",
    })
    mockDb.title.create.mockResolvedValue({
      id: "t1",
      tmdbId: 27205,
      mediaType: "MOVIE",
      title: "Inception",
      posterPath: "/poster.jpg",
      releaseDate: "2010-07-16",
      overview: "A thief...",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockDb.libraryEntry.upsert.mockResolvedValue({
      id: "le1",
      userId: "u1",
      titleId: "t1",
      status: "WANT_TO_WATCH",
      personalNote: null,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: { id: "t1", title: "Inception" },
    } as any)
    mockDb.activityEvent.create.mockResolvedValue({} as any)

    const result = await addToLibrary({
      tmdbId: 27205,
      mediaType: "MOVIE",
      status: "WANT_TO_WATCH",
    })

    expect(result.success).toBe(true)
    expect(mockDb.title.create).toHaveBeenCalled()
    expect(mockDb.libraryEntry.upsert).toHaveBeenCalled()
    expect(mockDb.activityEvent.create).toHaveBeenCalled()
  })

  it("uses existing title if already in DB", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.title.findUnique.mockResolvedValue({
      id: "t1",
      tmdbId: 27205,
      mediaType: "MOVIE",
      title: "Inception",
      posterPath: null,
      releaseDate: null,
      overview: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockDb.libraryEntry.upsert.mockResolvedValue({ id: "le1" } as any)
    mockDb.activityEvent.create.mockResolvedValue({} as any)

    const result = await addToLibrary({
      tmdbId: 27205,
      mediaType: "MOVIE",
      status: "WATCHING",
    })

    expect(result.success).toBe(true)
    expect(mockDb.title.create).not.toHaveBeenCalled()
    expect(mockGetTitleDetails).not.toHaveBeenCalled()
  })

  it("returns VALIDATION_ERROR for invalid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)

    const result = await addToLibrary({
      tmdbId: -1,
      mediaType: "INVALID" as any,
      status: "WANT_TO_WATCH",
    })

    expect(result.code).toBe("VALIDATION_ERROR")
  })
})

describe("getLibrary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns UNAUTHORIZED when not logged in", async () => {
    mockAuth.mockResolvedValue(null as any)
    const result = await getLibrary()
    expect(result.code).toBe("UNAUTHORIZED")
  })

  it("returns entries for logged-in user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.libraryEntry.findMany.mockResolvedValue([
      { id: "le1", status: "WATCHING", title: { title: "Inception" } },
    ] as any)

    const result = await getLibrary()
    expect(result.success).toBe(true)
    expect(result.entries).toHaveLength(1)
  })

  it("filters by status when provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.libraryEntry.findMany.mockResolvedValue([])

    await getLibrary("WATCHED")
    expect(mockDb.libraryEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "u1", status: "WATCHED" } })
    )
  })
})
