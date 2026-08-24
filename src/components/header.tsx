import { auth, signOut } from "@/lib/auth"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { DesktopNavLinks } from "@/components/nav-links"

export async function Header() {
  const session = await auth()

  if (!session?.user) return null

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/library" className="shrink-0 font-semibold text-lg">
          Movie Tracker
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-8 md:flex">
          <DesktopNavLinks />
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/settings"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            aria-label="Settings"
          >
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
