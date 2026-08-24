/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest"

describe("Environment variables", () => {
  it("should validate and expose required env vars", async () => {
    const { env } = await import("../env")

    expect(env.DATABASE_URL).toBeDefined()
    expect(env.NEXTAUTH_SECRET).toBeDefined()
    expect(env.NEXTAUTH_URL).toBeDefined()
  })
})
