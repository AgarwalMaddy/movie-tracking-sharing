import { auth } from "@/lib/auth"

export default async function LibraryPage() {
  const session = await auth()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Library</h1>
      <p className="text-muted-foreground">
        Welcome, {session?.user?.name}!
      </p>
    </div>
  )
}
