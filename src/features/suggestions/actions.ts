"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTitleDetails } from "@/lib/tmdb"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { MediaType, SuggestionStatus, WatchStatus } from "@prisma/client"

const sendSuggestionSchema = z.object({
  recipientId: z.string(),
  tmdbId: z.number(),
  mediaType: z.enum(["MOVIE", "TV"]),
  message: z.string().min(10).max(1000),
})

export async function sendSuggestion(
  input: z.infer<typeof sendSuggestionSchema>
) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const validated = sendSuggestionSchema.parse(input)

    const friendship = await db.friendship.findFirst({
      where: {
        userId: session.user.id,
        friendId: validated.recipientId,
      },
    })

    if (!friendship) {
      return { error: "Not friends with recipient", code: "NOT_FRIENDS" }
    }

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

    const suggestion = await db.suggestion.create({
      data: {
        senderId: session.user.id,
        recipientId: validated.recipientId,
        titleId: title.id,
        message: validated.message,
      },
      include: {
        title: true,
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    await db.activityEvent.create({
      data: {
        actorId: session.user.id,
        type: "SUGGESTION_SENT",
        payload: {
          suggestionId: suggestion.id,
          recipientId: validated.recipientId,
          titleId: title.id,
          title: title.title,
        },
      },
    })

    revalidatePath("/suggestions")
    revalidatePath("/feed")

    return { success: true, suggestion }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid input", code: "VALIDATION_ERROR" }
    }

    console.error("Send suggestion error:", error)
    return { error: "Failed to send suggestion", code: "SERVER_ERROR" }
  }
}

export async function respondToSuggestion(
  suggestionId: string,
  accept: boolean
) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const suggestion = await db.suggestion.findUnique({
      where: { id: suggestionId },
      include: { title: true },
    })

    if (!suggestion || suggestion.recipientId !== session.user.id) {
      return { error: "Suggestion not found", code: "NOT_FOUND" }
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      return { error: "Suggestion already processed", code: "INVALID_STATE" }
    }

    if (accept) {
      await db.$transaction([
        db.libraryEntry.upsert({
          where: {
            userId_titleId: {
              userId: session.user.id,
              titleId: suggestion.titleId,
            },
          },
          create: {
            userId: session.user.id,
            titleId: suggestion.titleId,
            status: WatchStatus.WANT_TO_WATCH,
          },
          update: {
            status: WatchStatus.WANT_TO_WATCH,
          },
        }),
        db.suggestion.update({
          where: { id: suggestionId },
          data: { status: SuggestionStatus.ACCEPTED },
        }),
        db.activityEvent.create({
          data: {
            actorId: session.user.id,
            type: "SUGGESTION_ACCEPTED",
            payload: {
              suggestionId,
              titleId: suggestion.titleId,
              title: suggestion.title.title,
            },
          },
        }),
      ])
    } else {
      await db.suggestion.update({
        where: { id: suggestionId },
        data: { status: SuggestionStatus.DISMISSED },
      })
    }

    revalidatePath("/suggestions")
    revalidatePath("/library")
    revalidatePath("/feed")

    return { success: true }
  } catch (error) {
    console.error("Respond to suggestion error:", error)
    return { error: "Failed to process suggestion", code: "SERVER_ERROR" }
  }
}

export async function getSuggestions() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const received = await db.suggestion.findMany({
      where: { recipientId: session.user.id },
      include: {
        title: true,
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const sent = await db.suggestion.findMany({
      where: { senderId: session.user.id },
      include: {
        title: true,
        recipient: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, received, sent }
  } catch (error) {
    console.error("Get suggestions error:", error)
    return { error: "Failed to fetch suggestions", code: "SERVER_ERROR" }
  }
}
