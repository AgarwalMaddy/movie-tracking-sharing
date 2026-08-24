/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "../route"
import { searchTitles } from "@/lib/tmdb"

const mockSearch = vi.mocked(searchTitles)

describe("GET /api/tmdb/search", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns search results for valid query", async () => {
    mockSearch.mockResolvedValue([
      {
        tmdbId: 27205,
        title: "Inception",
        mediaType: "MOVIE",
        posterPath: "/poster.jpg",
        releaseDate: "2010-07-16",
        overview: "A thief...",
      },
    ])

    const req = new Request("http://localhost:3000/api/tmdb/search?q=inception")
    const res = await GET(req)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results).toHaveLength(1)
    expect(json.results[0].title).toBe("Inception")
  })

  it("returns 400 for missing query param", async () => {
    const req = new Request("http://localhost:3000/api/tmdb/search")
    const res = await GET(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe("VALIDATION_ERROR")
  })

  it("returns 400 for empty query", async () => {
    const req = new Request("http://localhost:3000/api/tmdb/search?q=")
    const res = await GET(req)

    expect(res.status).toBe(400)
  })

  it("returns 500 when TMDB errors", async () => {
    mockSearch.mockRejectedValue(new Error("TMDB down"))

    const req = new Request("http://localhost:3000/api/tmdb/search?q=test")
    const res = await GET(req)

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.code).toBe("TMDB_ERROR")
  })
})
