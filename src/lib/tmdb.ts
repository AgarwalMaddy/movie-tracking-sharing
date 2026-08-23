import { env } from "@/lib/env"
import { z } from "zod"

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

const tmdbSearchResultSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  media_type: z.enum(["movie", "tv"]),
  poster_path: z.string().nullable(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  overview: z.string().optional(),
})

const tmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  poster_path: z.string().nullable(),
  release_date: z.string().optional(),
  overview: z.string().optional(),
})

const tmdbTVSchema = z.object({
  id: z.number(),
  name: z.string(),
  poster_path: z.string().nullable(),
  first_air_date: z.string().optional(),
  overview: z.string().optional(),
})

export type TMDBSearchResult = {
  tmdbId: number
  title: string
  mediaType: "MOVIE" | "TV"
  posterPath: string | null
  releaseDate: string | null
  overview: string | null
}

export type TMDBTitleDetails = TMDBSearchResult

async function fetchTMDB(endpoint: string) {
  if (!env.TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY not configured")
  }

  const url = `${TMDB_BASE_URL}${endpoint}${
    endpoint.includes("?") ? "&" : "?"
  }api_key=${env.TMDB_API_KEY}`

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`)
  }

  return response.json()
}

export async function searchTitles(query: string): Promise<TMDBSearchResult[]> {
  const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}`)

  const results = z
    .array(tmdbSearchResultSchema)
    .parse(data.results)
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")

  return results.map((item) => ({
    tmdbId: item.id,
    title: item.title || item.name || "Unknown",
    mediaType: item.media_type === "movie" ? "MOVIE" : "TV",
    posterPath: item.poster_path,
    releaseDate: item.release_date || item.first_air_date || null,
    overview: item.overview || null,
  }))
}

export async function getTitleDetails(
  tmdbId: number,
  mediaType: "MOVIE" | "TV"
): Promise<TMDBTitleDetails> {
  const endpoint = mediaType === "MOVIE" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`
  const data = await fetchTMDB(endpoint)

  if (mediaType === "MOVIE") {
    const movie = tmdbMovieSchema.parse(data)
    return {
      tmdbId: movie.id,
      title: movie.title,
      mediaType: "MOVIE",
      posterPath: movie.poster_path,
      releaseDate: movie.release_date || null,
      overview: movie.overview || null,
    }
  }

  const tv = tmdbTVSchema.parse(data)
  return {
    tmdbId: tv.id,
    title: tv.name,
    mediaType: "TV",
    posterPath: tv.poster_path,
    releaseDate: tv.first_air_date || null,
    overview: tv.overview || null,
  }
}
