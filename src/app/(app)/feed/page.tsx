import { getFeed } from "@/features/feed/actions"
import { ActivityItem } from "@/features/feed/components/activity-item"

export default async function FeedPage() {
  const result = await getFeed()

  if (!result.success || !result.events) {
    return <div>Error loading feed</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Activity Feed</h1>

      {result.events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No activity yet. Add some friends to see their updates!
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {result.events.map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
