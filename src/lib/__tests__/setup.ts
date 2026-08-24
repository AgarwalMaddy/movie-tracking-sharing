import { beforeAll } from "vitest"

beforeAll(() => {
  process.env.DATABASE_URL =
    "postgresql://test:test@localhost:5432/test?schema=public"
  process.env.NEXTAUTH_SECRET = "test-secret-at-least-32-characters-long"
  process.env.NEXTAUTH_URL = "http://localhost:3000"
})
