import { WatchStatus } from "@prisma/client"
import { AddTitleButton } from "@/features/library/components/add-title-button"
import { LibraryList } from "@/features/library/components/library-list"
import { getLibrary } from "@/features/library/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function LibraryPage() {
  const result = await getLibrary()

  if (!result.success || !result.entries) {
    return <div>Error loading library</div>
  }

  const wantToWatch = result.entries.filter(
    (entry) => entry.status === WatchStatus.WANT_TO_WATCH
  )
  const watching = result.entries.filter(
    (entry) => entry.status === WatchStatus.WATCHING
  )
  const watched = result.entries.filter(
    (entry) => entry.status === WatchStatus.WATCHED
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Library</h1>
        <AddTitleButton />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All ({result.entries.length})</TabsTrigger>
          <TabsTrigger value="want">
            Want to Watch ({wantToWatch.length})
          </TabsTrigger>
          <TabsTrigger value="watching">Watching ({watching.length})</TabsTrigger>
          <TabsTrigger value="watched">Watched ({watched.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <LibraryList entries={result.entries} />
        </TabsContent>
        <TabsContent value="want">
          <LibraryList entries={wantToWatch} />
        </TabsContent>
        <TabsContent value="watching">
          <LibraryList entries={watching} />
        </TabsContent>
        <TabsContent value="watched">
          <LibraryList entries={watched} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
