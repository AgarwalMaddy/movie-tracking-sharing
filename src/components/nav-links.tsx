"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookMarked, Users, Sparkles, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/library", label: "Library", icon: BookMarked },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/suggestions", label: "Suggestions", icon: Sparkles },
  { href: "/feed", label: "Feed", icon: Radio },
] as const

export function DesktopNavLinks() {
  const pathname = usePathname()

  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm transition-colors",
              active
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-4">
        {links.map((link) => {
          const Icon = link.icon
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-3 text-[10px]",
                  active
                    ? "font-semibold text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
