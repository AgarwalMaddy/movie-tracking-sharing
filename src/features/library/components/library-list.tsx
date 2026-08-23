import { LibraryEntryCard } from "./library-entry-card"
import type { LibraryEntry, Title } from "@prisma/client"

type LibraryEntryWithTitle = LibraryEntry & { title: Title }

export function LibraryList({ entries }: { entries: LibraryEntryWithTitle[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No titles in your library yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <LibraryEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
