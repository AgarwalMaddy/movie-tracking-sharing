import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return <div>Not authenticated</div>
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      email: true,
      image: true,
      bio: true,
    },
  })

  if (!user) {
    return <div>User not found</div>
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-lg">{initials || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p>{user.email}</p>
            </div>
            {user.bio && (
              <div>
                <p className="text-muted-foreground">Bio</p>
                <p>{user.bio}</p>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Profile editing will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
