import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { LibraryEntry, Title } from "@prisma/client"

type LibraryEntryWithTitle = LibraryEntry & { title: Title }

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export function LibraryEntryCard({ entry }: { entry: LibraryEntryWithTitle }) {
  return (
    <Card>
      <CardContent className="p-4 flex gap-4">
        {entry.title.posterPath && (
          <img
            src={`https://image.tmdb.org/t/p/w154${entry.title.posterPath}`}
            alt={entry.title.title}
            className="w-24 h-36 object-cover rounded"
          />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{entry.title.title}</h3>
              <p className="text-sm text-muted-foreground">
                {entry.title.mediaType} • {entry.title.releaseDate?.split("-")[0]}
              </p>
            </div>
            <Badge variant="secondary">{formatStatus(entry.status)}</Badge>
          </div>

          {entry.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{entry.rating}/10</span>
            </div>
          )}

          {entry.personalNote && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {entry.personalNote}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
