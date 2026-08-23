"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTitleDetails } from "@/lib/tmdb"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { MediaType, WatchStatus } from "@prisma/client"

const addToLibrarySchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(["MOVIE", "TV"]),
  status: z.nativeEnum(WatchStatus),
  personalNote: z.string().max(500).optional(),
  rating: z.number().min(1).max(10).optional(),
})

export async function addToLibrary(input: z.infer<typeof addToLibrarySchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const validated = addToLibrarySchema.parse(input)

    let title = await db.title.findUnique({
      where: {
        tmdbId_mediaType: {
          tmdbId: validated.tmdbId,
          mediaType: validated.mediaType as MediaType,
        },
      },
    })

    if (!title) {
      const tmdbDetails = await getTitleDetails(
        validated.tmdbId,
        validated.mediaType
      )

      title = await db.title.create({
        data: {
          tmdbId: tmdbDetails.tmdbId,
          mediaType: tmdbDetails.mediaType as MediaType,
          title: tmdbDetails.title,
          posterPath: tmdbDetails.posterPath,
          releaseDate: tmdbDetails.releaseDate,
          overview: tmdbDetails.overview,
        },
      })
    }

    const entry = await db.libraryEntry.upsert({
      where: {
        userId_titleId: {
          userId: session.user.id,
          titleId: title.id,
        },
      },
      create: {
        userId: session.user.id,
        titleId: title.id,
        status: validated.status,
        personalNote: validated.personalNote,
        rating: validated.rating,
      },
      update: {
        status: validated.status,
        personalNote: validated.personalNote,
        rating: validated.rating,
      },
      include: { title: true },
    })

    await db.activityEvent.create({
      data: {
        actorId: session.user.id,
        type: "LIBRARY_ADD",
        payload: {
          titleId: title.id,
          title: title.title,
          status: validated.status,
        },
      },
    })

    revalidatePath("/library")
    revalidatePath("/feed")

    return { success: true, entry }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid input", code: "VALIDATION_ERROR" }
    }

    console.error("Add to library error:", error)
    return { error: "Failed to add to library", code: "SERVER_ERROR" }
  }
}

export async function getLibrary(status?: WatchStatus) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const entries = await db.libraryEntry.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status }),
      },
      include: { title: true },
      orderBy: { updatedAt: "desc" },
    })

    return { success: true, entries }
  } catch (error) {
    console.error("Get library error:", error)
    return { error: "Failed to fetch library", code: "SERVER_ERROR" }
  }
}
