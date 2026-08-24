import { describe, it, expect, vi, beforeEach } from "vitest"
import { getFeed } from "../actions"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

const mockAuth = vi.mocked(auth)
const mockDb = vi.mocked(db)

describe("getFeed", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns UNAUTHORIZED when not logged in", async () => {
    mockAuth.mockResolvedValue(null as any)
    const result = await getFeed()
    expect(result.code).toBe("UNAUTHORIZED")
  })

  it("returns empty feed when user has no friends", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendship.findMany.mockResolvedValue([])
    mockDb.activityEvent.findMany.mockResolvedValue([])

    const result = await getFeed()
    expect(result.success).toBe(true)
    expect(result.events).toEqual([])
  })

  it("returns only friend activity", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any)
    mockDb.friendship.findMany.mockResolvedValue([
      { friendId: "u2" },
    ] as any)
    mockDb.activityEvent.findMany.mockResolvedValue([
      {
        id: "e1",
        actorId: "u2",
        type: "LIBRARY_ADD",
        payload: { title: "Inception" },
        actor: { id: "u2", name: "Alex", username: "alex", image: null },
      },
    ] as any)

    const result = await getFeed()
    expect(result.success).toBe(true)
    expect(result.events).toHaveLength(1)
    expect(mockDb.activityEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { actorId: { in: ["u2"] } },
      })
    )
  })
})
