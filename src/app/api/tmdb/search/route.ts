import { NextResponse } from "next/server"
import { z } from "zod"
import { searchTitles } from "@/lib/tmdb"

const searchParamsSchema = z.object({
  q: z.string().min(1),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const { q } = searchParamsSchema.parse({ q: searchParams.get("q") })
    const results = await searchTitles(q)
    return NextResponse.json({ results })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameter", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    console.error("TMDB search error:", error)
    return NextResponse.json(
      { error: "Failed to search titles", code: "TMDB_ERROR" },
      { status: 500 }
    )
  }
}
