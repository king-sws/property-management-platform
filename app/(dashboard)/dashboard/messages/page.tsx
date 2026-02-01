// app/(dashboard)/dashboard/messages/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/actions/messages";
import ConversationList from "@/components/messages/conversation-list";
import NewConversationButton from "@/components/messages/new-conversation-button";
import { MessageSquare } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Container, Stack } from "@/components/ui/container";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const result = await getConversations('');

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-0">
          <div>
            <Typography variant="h2" className="mb-1 text-xl sm:text-2xl">
              Messages
            </Typography>
            <Typography variant="muted" className="text-sm sm:text-base">
              Communicate with tenants, landlords, and vendors
            </Typography>
          </div>
          <NewConversationButton />
        </div>

        {/* Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 px-4 sm:px-0">
            <Suspense fallback={<ConversationListSkeleton />}>
              {result.success && result.data?.conversations ? (
                <ConversationList conversations={result.data.conversations} />
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <Typography variant="muted">No conversations yet</Typography>
                </div>
              )}
            </Suspense>
          </div>

          {/* Desktop placeholder - hidden on mobile */}
          <div className="lg:col-span-2 hidden lg:flex items-center justify-center border rounded-lg bg-muted/20 min-h-[500px]">
            <div className="text-center px-4">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <Typography variant="h3" className="mb-2">
                Select a conversation
              </Typography>
              <Typography variant="muted">
                Choose a conversation from the list to start messaging
              </Typography>
            </div>
          </div>
        </div>
      </Stack>
    </Container>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-3 sm:p-4 border rounded-lg animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}