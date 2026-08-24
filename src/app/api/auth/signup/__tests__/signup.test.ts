/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"
import { db } from "@/lib/db"

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed-password"),
}))

vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
}))

const mockDb = vi.mocked(db)

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => vi.clearAllMocks())

  it("creates user with valid input", async () => {
    mockDb.user.findFirst.mockResolvedValue(null)
    mockDb.user.create.mockResolvedValue({ id: "u1" } as any)
    mockDb.verificationToken.create.mockResolvedValue({} as any)

    const res = await POST(
      makeRequest({
        email: "test@example.com",
        password: "securepass123",
        username: "testuser",
        name: "Test User",
      })
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockDb.user.create).toHaveBeenCalled()
  })

  it("rejects duplicate email/username", async () => {
    mockDb.user.findFirst.mockResolvedValue({ id: "existing" } as any)

    const res = await POST(
      makeRequest({
        email: "taken@example.com",
        password: "securepass123",
        username: "taken",
        name: "Taken User",
      })
    )

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe("USER_EXISTS")
  })

  it("rejects weak password", async () => {
    const res = await POST(
      makeRequest({
        email: "test@example.com",
        password: "short",
        username: "testuser",
        name: "Test User",
      })
    )

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe("VALIDATION_ERROR")
  })

  it("rejects invalid email", async () => {
    const res = await POST(
      makeRequest({
        email: "not-an-email",
        password: "securepass123",
        username: "testuser",
        name: "Test User",
      })
    )

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe("VALIDATION_ERROR")
  })

  it("rejects invalid username format", async () => {
    const res = await POST(
      makeRequest({
        email: "test@example.com",
        password: "securepass123",
        username: "bad user name!",
        name: "Test User",
      })
    )

    expect(res.status).toBe(400)
  })
})
