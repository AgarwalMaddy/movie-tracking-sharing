import { describe, it, expect, vi, beforeEach } from "vitest"
import { sendSuggestion, respondToSuggestion, getSuggestions } from "../actions"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { getTitleDetails } from "@/lib/tmdb"

const mockAuth = vi.mocked(auth)
const mockDb = vi.mocked(db)
const mockGetTitleDetails = vi.mocked(getTitleDetails)

describe("sendSuggestion", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns UNAUTHORIZED when not logged in", async () => {
    mockAuth.mockResolvedValue(null as any)
    const result = await sendSuggestion({
      recipientId: "u2",
      tmdbId: 27205,
      mediaType: "MOVIE",
      message: "You will love this movie trust me",
    })
    expect(result.code).toBe("UNAUTHORIZED")
  })

  it("blocks suggestion to non-friend", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendship.findFirst.mockResolvedValue(null)

    const result = await sendSuggestion({
      recipientId: "u2",
      tmdbId: 27205,
      mediaType: "MOVIE",
      message: "You will love this movie trust me",
    })
    expect(result.code).toBe("NOT_FRIENDS")
  })

  it("sends suggestion to friend successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendship.findFirst.mockResolvedValue({ id: "f1" } as any)
    mockDb.title.findUnique.mockResolvedValue({
      id: "t1",
      tmdbId: 27205,
      title: "Inception",
    } as any)
    mockDb.suggestion.create.mockResolvedValue({
      id: "s1",
      title: { title: "Inception" },
      sender: { id: "u1", name: "Me", username: "me" },
    } as any)
    mockDb.activityEvent.create.mockResolvedValue({} as any)

    const result = await sendSuggestion({
      recipientId: "u2",
      tmdbId: 27205,
      mediaType: "MOVIE",
      message: "You will love this movie trust me",
    })
    expect(result.success).toBe(true)
  })

  it("returns VALIDATION_ERROR for short message", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendship.findFirst.mockResolvedValue({ id: "f1" } as any)

    const result = await sendSuggestion({
      recipientId: "u2",
      tmdbId: 27205,
      mediaType: "MOVIE",
      message: "Watch it",
    })
    expect(result.code).toBe("VALIDATION_ERROR")
  })
})

describe("respondToSuggestion", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns NOT_FOUND for nonexistent suggestion", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.suggestion.findUnique.mockResolvedValue(null)

    const result = await respondToSuggestion("bad-id", true)
    expect(result.code).toBe("NOT_FOUND")
  })

  it("blocks response to already-processed suggestion", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.suggestion.findUnique.mockResolvedValue({
      id: "s1",
      recipientId: "u1",
      status: "ACCEPTED",
      title: { title: "Inception" },
    } as any)

    const result = await respondToSuggestion("s1", true)
    expect(result.code).toBe("INVALID_STATE")
  })

  it("accepts suggestion and adds to library via transaction", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.suggestion.findUnique.mockResolvedValue({
      id: "s1",
      recipientId: "u1",
      titleId: "t1",
      status: "PENDING",
      title: { title: "Inception" },
    } as any)
    mockDb.$transaction.mockResolvedValue([])

    const result = await respondToSuggestion("s1", true)
    expect(result.success).toBe(true)
    expect(mockDb.$transaction).toHaveBeenCalled()
  })

  it("dismisses suggestion", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.suggestion.findUnique.mockResolvedValue({
      id: "s1",
      recipientId: "u1",
      titleId: "t1",
      status: "PENDING",
      title: { title: "Inception" },
    } as any)
    mockDb.suggestion.update.mockResolvedValue({} as any)

    const result = await respondToSuggestion("s1", false)
    expect(result.success).toBe(true)
    expect(mockDb.suggestion.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "DISMISSED" } })
    )
  })
})

describe("getSuggestions", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns received and sent suggestions", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.suggestion.findMany
      .mockResolvedValueOnce([{ id: "r1" }] as any)
      .mockResolvedValueOnce([{ id: "s1" }] as any)

    const result = await getSuggestions()
    expect(result.success).toBe(true)
    expect(result.received).toHaveLength(1)
    expect(result.sent).toHaveLength(1)
  })
})
