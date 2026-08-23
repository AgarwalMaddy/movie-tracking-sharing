import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 py-16 md:px-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.92_0.04_175)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.94_0.03_95)_0%,_transparent_50%)]"
      />
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <p className="mb-4 text-sm font-medium tracking-wide text-primary">
          Movie Tracking &amp; Sharing
        </p>
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
          Your library.
          <br />
          Their suggestions.
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          Track what you watch and send private recommendations to friends —
          not a public feed.
        </p>
        <div className="flex gap-4">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
