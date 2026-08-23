import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { ActivityType } from "@prisma/client"
import type { Prisma } from "@prisma/client"

type User = {
  id: string
  name: string
  username: string
  image: string | null
}

type ActivityPayload = {
  title?: string
  status?: string
}

type ActivityEvent = {
  id: string
  type: ActivityType
  payload: Prisma.JsonValue
  createdAt: Date
  actor: User
}

function getPayload(payload: Prisma.JsonValue): ActivityPayload {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as ActivityPayload
  }

  return {}
}

function formatStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

function getActivityMessage(event: ActivityEvent) {
  const { type } = event
  const payload = getPayload(event.payload)

  switch (type) {
    case ActivityType.LIBRARY_ADD:
      return (
        <>
          <span>added </span>
          <span className="font-semibold">{payload.title}</span>
          <span> to {payload.status ? formatStatus(payload.status) : "library"}</span>
        </>
      )
    case ActivityType.LIBRARY_STATUS_CHANGE:
      return (
        <>
          <span>moved </span>
          <span className="font-semibold">{payload.title}</span>
          <span> to {payload.status ? formatStatus(payload.status) : "a new status"}</span>
        </>
      )
    case ActivityType.SUGGESTION_SENT:
      return <span>suggested a title to a friend</span>
    case ActivityType.SUGGESTION_ACCEPTED:
      return (
        <>
          <span>accepted a suggestion for </span>
          <span className="font-semibold">{payload.title}</span>
        </>
      )
    default:
      return <span>performed an action</span>
  }
}

export function ActivityItem({ event }: { event: ActivityEvent }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={event.actor.image || undefined} />
            <AvatarFallback>
              {event.actor.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm">
              <span className="font-semibold">{event.actor.name}</span>{" "}
              {getActivityMessage(event)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(event.createdAt))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
