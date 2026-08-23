import { SearchUsers } from "@/features/friends/components/search-users"
import { FriendRequests } from "@/features/friends/components/friend-requests"
import { getFriendRequests } from "@/features/friends/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function FriendsPage() {
  const requestsResult = await getFriendRequests()

  if (!requestsResult.success) {
    return <div>Error loading friend requests</div>
  }

  const { received, sent } = requestsResult

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Friends</h1>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="search">Find Friends</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {received.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {received.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <SearchUsers />
        </TabsContent>

        <TabsContent value="requests">
          <FriendRequests received={received} sent={sent} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
