import { getSuggestions } from "@/features/suggestions/actions"
import { SuggestionCard } from "@/features/suggestions/components/suggestion-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuggestionStatus } from "@prisma/client"

export default async function SuggestionsPage() {
  const result = await getSuggestions()

  if (!result.success || !result.received || !result.sent) {
    return <div>Error loading suggestions</div>
  }

  const pendingReceived = result.received.filter(
    (s) => s.status === SuggestionStatus.PENDING
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Suggestions</h1>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="received">
            Inbox
            {pendingReceived.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {pendingReceived.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Sent ({result.sent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {result.received.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              No suggestions yet
            </p>
          ) : (
            result.received.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                type="received"
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {result.sent.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              You haven&apos;t sent any suggestions yet
            </p>
          ) : (
            result.sent.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                type="sent"
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
