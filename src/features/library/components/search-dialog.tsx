"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WatchStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addToLibrary } from "../actions"

type SearchResult = {
  tmdbId: number
  title: string
  mediaType: "MOVIE" | "TV"
  posterPath: string | null
  releaseDate: string | null
}

export function SearchDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [status, setStatus] = useState<WatchStatus>(WatchStatus.WANT_TO_WATCH)
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/tmdb/search?q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return

    setIsAdding(true)

    const formData = new FormData(e.currentTarget)
    const personalNote = formData.get("personalNote") as string
    const rating = formData.get("rating") as string

    const result = await addToLibrary({
      tmdbId: selected.tmdbId,
      mediaType: selected.mediaType,
      status,
      personalNote: personalNote || undefined,
      rating: rating ? parseInt(rating, 10) : undefined,
    })

    setIsAdding(false)

    if (result.success) {
      setOpen(false)
      setSelected(null)
      setResults([])
      setQuery("")
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Title to Library</DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search titles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={`${result.mediaType}-${result.tmdbId}`}
                  type="button"
                  className="w-full flex items-center gap-4 p-3 border rounded-lg hover:bg-accent text-left"
                  onClick={() => setSelected(result)}
                >
                  {result.posterPath && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${result.posterPath}`}
                      alt={result.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{result.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.mediaType} • {result.releaseDate?.split("-")[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              {selected.posterPath && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${selected.posterPath}`}
                  alt={selected.title}
                  className="w-16 h-24 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-semibold">{selected.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selected.mediaType} • {selected.releaseDate?.split("-")[0]}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as WatchStatus)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value={WatchStatus.WANT_TO_WATCH}>Want to Watch</option>
                <option value={WatchStatus.WATCHING}>Watching</option>
                <option value={WatchStatus.WATCHED}>Watched</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-10)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="1"
                max="10"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalNote">Personal Note</Label>
              <Textarea
                id="personalNote"
                name="personalNote"
                placeholder="Your thoughts (optional)"
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelected(null)}
              >
                Back
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Adding..." : "Add to Library"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
