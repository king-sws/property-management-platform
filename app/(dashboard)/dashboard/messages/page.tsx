// app/(dashboard)/dashboard/messages/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/actions/messages";
import ConversationList from "@/components/messages/conversation-list";
import NewConversationButton from "@/components/messages/new-conversation-button";
import { MessageSquare } from "lucide-react";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const result = await getConversations('');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Communicate with tenants, landlords, and vendors
          </p>
        </div>
        <NewConversationButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Suspense fallback={<ConversationListSkeleton />}>
            {result.success && result.data?.conversations ? (
              <ConversationList conversations={result.data.conversations} />
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No conversations yet</p>
              </div>
            )}
          </Suspense>
        </div>

        <div className="lg:col-span-2 hidden lg:flex items-center justify-center border rounded-lg bg-muted/20">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
            <p className="text-muted-foreground">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}