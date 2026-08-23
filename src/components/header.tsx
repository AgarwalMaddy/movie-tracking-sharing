import { auth, signOut } from "@/lib/auth"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export async function Header() {
  const session = await auth()

  if (!session?.user) return null

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link href="/library" className="font-semibold text-lg">
            Movie Tracker
          </Link>
          <Link href="/library" className="text-sm hover:underline">
            Library
          </Link>
          <Link href="/friends" className="text-sm hover:underline">
            Friends
          </Link>
          <Link href="/suggestions" className="text-sm hover:underline">
            Suggestions
          </Link>
          <Link href="/feed" className="text-sm hover:underline">
            Feed
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/settings" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
            <Avatar>
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
