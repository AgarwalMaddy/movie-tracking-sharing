"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { respondToFriendRequest } from "../actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Check, X } from "lucide-react"

type User = {
  id: string
  username: string
  name: string
  image: string | null
}

type Request = {
  id: string
  requester?: User
  recipient?: User
}

export function FriendRequests({
  received,
  sent,
}: {
  received: Request[]
  sent: Request[]
}) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleRespond(requestId: string, accept: boolean) {
    setProcessing(requestId)
    await respondToFriendRequest(requestId, accept)
    setProcessing(null)
    router.refresh()
  }

  if (received.length === 0 && sent.length === 0) {
    return (
      <p className="text-center py-12 text-muted-foreground">
        No pending friend requests
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {received.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Received Requests</h3>
          <div className="space-y-2">
            {received.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.requester?.image || undefined} />
                      <AvatarFallback>
                        {request.requester?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{request.requester?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{request.requester?.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(request.id, true)}
                      disabled={processing === request.id}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(request.id, false)}
                      disabled={processing === request.id}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {sent.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Sent Requests</h3>
          <div className="space-y-2">
            {sent.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.recipient?.image || undefined} />
                    <AvatarFallback>
                      {request.recipient?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{request.recipient?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{request.recipient?.username} • Pending
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
