import { Header } from "@/components/header"
import { MobileNav } from "@/components/nav-links"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="w-full flex-1 px-4 py-8 pb-24 md:container md:mx-auto md:pb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
