"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { FriendRequestStatus } from "@prisma/client"

const sendFriendRequestSchema = z.object({
  recipientUsername: z.string(),
})

export async function sendFriendRequest(
  input: z.infer<typeof sendFriendRequestSchema>
) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const { recipientUsername } = sendFriendRequestSchema.parse(input)

    const recipient = await db.user.findUnique({
      where: { username: recipientUsername },
    })

    if (!recipient) {
      return { error: "User not found", code: "USER_NOT_FOUND" }
    }

    if (recipient.id === session.user.id) {
      return { error: "Cannot send request to yourself", code: "INVALID_REQUEST" }
    }

    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: recipient.id },
          { userId: recipient.id, friendId: session.user.id },
        ],
      },
    })

    if (existingFriendship) {
      return { error: "Already friends", code: "ALREADY_FRIENDS" }
    }

    const existingRequest = await db.friendRequest.findUnique({
      where: {
        requesterId_recipientId: {
          requesterId: session.user.id,
          recipientId: recipient.id,
        },
      },
    })

    if (existingRequest) {
      return { error: "Request already sent", code: "REQUEST_EXISTS" }
    }

    const request = await db.friendRequest.create({
      data: {
        requesterId: session.user.id,
        recipientId: recipient.id,
      },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    })

    revalidatePath("/friends")

    return { success: true, request }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid input", code: "VALIDATION_ERROR" }
    }

    console.error("Send friend request error:", error)
    return { error: "Failed to send request", code: "SERVER_ERROR" }
  }
}

export async function respondToFriendRequest(
  requestId: string,
  accept: boolean
) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const request = await db.friendRequest.findUnique({
      where: { id: requestId },
    })

    if (!request || request.recipientId !== session.user.id) {
      return { error: "Request not found", code: "NOT_FOUND" }
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      return { error: "Request already processed", code: "INVALID_STATE" }
    }

    if (accept) {
      await db.$transaction([
        db.friendship.create({
          data: {
            userId: request.requesterId,
            friendId: request.recipientId,
          },
        }),
        db.friendship.create({
          data: {
            userId: request.recipientId,
            friendId: request.requesterId,
          },
        }),
        db.friendRequest.update({
          where: { id: requestId },
          data: { status: FriendRequestStatus.ACCEPTED },
        }),
      ])
    } else {
      await db.friendRequest.update({
        where: { id: requestId },
        data: { status: FriendRequestStatus.DECLINED },
      })
    }

    revalidatePath("/friends")

    return { success: true }
  } catch (error) {
    console.error("Respond to friend request error:", error)
    return { error: "Failed to process request", code: "SERVER_ERROR" }
  }
}

export async function searchUsers(query: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  if (!query || query.length < 2) {
    return { success: true, users: [] }
  }

  try {
    const users = await db.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } },
          {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
      },
      take: 10,
    })

    return { success: true, users }
  } catch (error) {
    console.error("Search users error:", error)
    return { error: "Failed to search users", code: "SERVER_ERROR" }
  }
}

export async function getFriendRequests() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const received = await db.friendRequest.findMany({
      where: {
        recipientId: session.user.id,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const sent = await db.friendRequest.findMany({
      where: {
        requesterId: session.user.id,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        recipient: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, received, sent }
  } catch (error) {
    console.error("Get friend requests error:", error)
    return { error: "Failed to fetch requests", code: "SERVER_ERROR" }
  }
}
