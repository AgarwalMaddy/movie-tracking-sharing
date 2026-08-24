import { beforeAll, vi } from "vitest"

beforeAll(() => {
  process.env.DATABASE_URL =
    "postgresql://test:test@localhost:5432/test?schema=public"
  process.env.NEXTAUTH_SECRET = "test-secret-at-least-32-characters-long"
  process.env.NEXTAUTH_URL = "http://localhost:3000"
  process.env.SKIP_ENV_VALIDATION = "1"
})

vi.mock("@/lib/db", () => ({
  db: {
    title: { findUnique: vi.fn(), create: vi.fn() },
    libraryEntry: { upsert: vi.fn(), findMany: vi.fn() },
    activityEvent: { create: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    friendRequest: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    friendship: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    suggestion: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    verificationToken: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}))

vi.mock("@/lib/tmdb", () => ({
  searchTitles: vi.fn(),
  getTitleDetails: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))
