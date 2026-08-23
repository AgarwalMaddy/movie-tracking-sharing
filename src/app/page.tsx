import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Movie Tracking & Sharing
      </h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
        Track what you watch and share suggestions with friends
      </p>
      <div className="flex gap-4">
        <Link href="/signup" className={cn(buttonVariants())}>
          Get Started
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Sign In
        </Link>
      </div>
    </main>
  )
}
