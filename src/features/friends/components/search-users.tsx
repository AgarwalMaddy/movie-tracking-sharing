"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { searchUsers, sendFriendRequest } from "../actions"
import { UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  username: string
  name: string
  image: string | null
}

export function SearchUsers() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sendingTo, setSendingTo] = useState<string | null>(null)

  async function handleSearch() {
    if (query.length < 2) return

    setIsSearching(true)
    const result = await searchUsers(query)
    if (result.success && result.users) {
      setResults(result.users)
    }
    setIsSearching(false)
  }

  async function handleSendRequest(username: string) {
    setSendingTo(username)
    const result = await sendFriendRequest({ recipientUsername: username })
    setSendingTo(null)

    if (result.success) {
      router.refresh()
      setResults(results.filter((u) => u.username !== username))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by username or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="space-y-2">
        {results.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendRequest(user.username)}
                disabled={sendingTo === user.username}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {sendingTo === user.username ? "Sending..." : "Add Friend"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
