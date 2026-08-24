"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getFeed() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  try {
    const friendships = await db.friendship.findMany({
      where: { userId: session.user.id },
      select: { friendId: true },
    })

    const friendIds = friendships.map((f) => f.friendId)

    const events = await db.activityEvent.findMany({
      where: {
        actorId: { in: friendIds },
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return { success: true, events }
  } catch (error) {
    console.error("Get feed error:", error)
    return { error: "Failed to fetch feed", code: "SERVER_ERROR" }
  }
}
