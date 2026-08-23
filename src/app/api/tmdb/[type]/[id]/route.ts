import { NextResponse } from "next/server"
import { z } from "zod"
import { getTitleDetails } from "@/lib/tmdb"

const paramsSchema = z.object({
  type: z.enum(["movie", "tv"]),
  id: z.string().regex(/^\d+$/),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const resolved = await params
    const { type, id } = paramsSchema.parse(resolved)
    const mediaType = type === "movie" ? "MOVIE" : "TV"
    const details = await getTitleDetails(parseInt(id, 10), mediaType)
    return NextResponse.json(details)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    console.error("TMDB details error:", error)
    return NextResponse.json(
      { error: "Failed to fetch title details", code: "TMDB_ERROR" },
      { status: 500 }
    )
  }
}
