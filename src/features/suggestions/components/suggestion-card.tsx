"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { respondToSuggestion } from "../actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { formatDate } from "@/lib/utils"
import { SuggestionStatus } from "@prisma/client"

type User = {
  id: string
  name: string
  username: string
  image: string | null
}

type Title = {
  tmdbId: number
  title: string
  mediaType: string
  posterPath: string | null
  releaseDate: string | null
}

type Suggestion = {
  id: string
  message: string
  status: SuggestionStatus
  createdAt: Date
  sender?: User
  recipient?: User
  title: Title
}

export function SuggestionCard({
  suggestion,
  type,
}: {
  suggestion: Suggestion
  type: "received" | "sent"
}) {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)

  async function handleRespond(accept: boolean) {
    setProcessing(true)
    await respondToSuggestion(suggestion.id, accept)
    setProcessing(false)
    router.refresh()
  }

  const user = type === "received" ? suggestion.sender : suggestion.recipient

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          {suggestion.title.posterPath && (
            <img
              src={`https://image.tmdb.org/t/p/w154${suggestion.title.posterPath}`}
              alt={suggestion.title.title}
              className="w-24 h-36 object-cover rounded"
            />
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{suggestion.title.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {suggestion.title.mediaType} •{" "}
                  {suggestion.title.releaseDate?.split("-")[0]}
                </p>
              </div>
              <Badge
                variant={
                  suggestion.status === SuggestionStatus.PENDING
                    ? "secondary"
                    : suggestion.status === SuggestionStatus.ACCEPTED
                      ? "default"
                      : "outline"
                }
              >
                {suggestion.status.toLowerCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="text-xs">
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                {type === "received" ? "From" : "To"} {user?.name} •{" "}
                {formatDate(new Date(suggestion.createdAt))}
              </p>
            </div>

            <p className="text-sm p-3 bg-muted rounded-lg">
              &ldquo;{suggestion.message}&rdquo;
            </p>

            {type === "received" &&
              suggestion.status === SuggestionStatus.PENDING && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(true)}
                    disabled={processing}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept & Add to Library
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(false)}
                    disabled={processing}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
