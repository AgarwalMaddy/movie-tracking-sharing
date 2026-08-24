import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  sendFriendRequest,
  respondToFriendRequest,
  searchUsers,
  getFriendRequests,
} from "../actions"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

const mockAuth = vi.mocked(auth)
const mockDb = vi.mocked(db)

describe("sendFriendRequest", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns UNAUTHORIZED when not logged in", async () => {
    mockAuth.mockResolvedValue(null as any)
    const result = await sendFriendRequest({ recipientUsername: "alex" })
    expect(result.code).toBe("UNAUTHORIZED")
  })

  it("returns USER_NOT_FOUND for unknown username", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.user.findUnique.mockResolvedValue(null)

    const result = await sendFriendRequest({ recipientUsername: "ghost" })
    expect(result.code).toBe("USER_NOT_FOUND")
  })

  it("blocks self-request", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.user.findUnique.mockResolvedValue({ id: "u1" } as any)

    const result = await sendFriendRequest({ recipientUsername: "me" })
    expect(result.code).toBe("INVALID_REQUEST")
  })

  it("blocks duplicate request", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.user.findUnique.mockResolvedValue({ id: "u2" } as any)
    mockDb.friendship.findFirst.mockResolvedValue(null)
    mockDb.friendRequest.findUnique.mockResolvedValue({ id: "fr1" } as any)

    const result = await sendFriendRequest({ recipientUsername: "alex" })
    expect(result.code).toBe("REQUEST_EXISTS")
  })

  it("blocks when already friends", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.user.findUnique.mockResolvedValue({ id: "u2" } as any)
    mockDb.friendship.findFirst.mockResolvedValue({ id: "f1" } as any)

    const result = await sendFriendRequest({ recipientUsername: "alex" })
    expect(result.code).toBe("ALREADY_FRIENDS")
  })

  it("creates request successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.user.findUnique.mockResolvedValue({ id: "u2" } as any)
    mockDb.friendship.findFirst.mockResolvedValue(null)
    mockDb.friendRequest.findUnique.mockResolvedValue(null)
    mockDb.friendRequest.create.mockResolvedValue({
      id: "fr1",
      recipient: { id: "u2", name: "Alex", username: "alex", image: null },
    } as any)

    const result = await sendFriendRequest({ recipientUsername: "alex" })
    expect(result.success).toBe(true)
  })
})

describe("respondToFriendRequest", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns NOT_FOUND for nonexistent request", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendRequest.findUnique.mockResolvedValue(null)

    const result = await respondToFriendRequest("bad-id", true)
    expect(result.code).toBe("NOT_FOUND")
  })

  it("blocks response to already-processed request", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendRequest.findUnique.mockResolvedValue({
      id: "fr1",
      recipientId: "u1",
      status: "ACCEPTED",
    } as any)

    const result = await respondToFriendRequest("fr1", true)
    expect(result.code).toBe("INVALID_STATE")
  })

  it("accepts request and creates mutual friendships", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendRequest.findUnique.mockResolvedValue({
      id: "fr1",
      requesterId: "u2",
      recipientId: "u1",
      status: "PENDING",
    } as any)
    mockDb.$transaction.mockResolvedValue([])

    const result = await respondToFriendRequest("fr1", true)
    expect(result.success).toBe(true)
    expect(mockDb.$transaction).toHaveBeenCalled()
  })

  it("declines request", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendRequest.findUnique.mockResolvedValue({
      id: "fr1",
      requesterId: "u2",
      recipientId: "u1",
      status: "PENDING",
    } as any)
    mockDb.friendRequest.update.mockResolvedValue({} as any)

    const result = await respondToFriendRequest("fr1", false)
    expect(result.success).toBe(true)
    expect(mockDb.friendRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "DECLINED" } })
    )
  })
})

describe("searchUsers", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns empty for short query", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    const result = await searchUsers("a")
    expect(result.users).toEqual([])
    expect(mockDb.user.findMany).not.toHaveBeenCalled()
  })

  it("returns matching users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.user.findMany.mockResolvedValue([
      { id: "u2", username: "alex", name: "Alex Chen", image: null },
    ] as any)

    const result = await searchUsers("ale")
    expect(result.success).toBe(true)
    expect(result.users).toHaveLength(1)
  })
})

describe("getFriendRequests", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns received and sent requests", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendRequest.findMany
      .mockResolvedValueOnce([{ id: "r1" }] as any)
      .mockResolvedValueOnce([{ id: "s1" }] as any)

    const result = await getFriendRequests()
    expect(result.success).toBe(true)
    expect(result.received).toHaveLength(1)
    expect(result.sent).toHaveLength(1)
  })
})
