// app/(dashboard)/dashboard/messages/[id]/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getConversationMessages, getConversations } from "@/actions/messages";
import ConversationList from "@/components/messages/conversation-list";
import MessageThread from "@/components/messages/message-thread";
import MessageInput from "@/components/messages/message-input";
import ConversationHeader from "@/components/messages/conversation-header";
import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>; // Changed to Promise
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  // Await params to get the id
  const { id } = await params;

  const [conversationsResult, messagesResult, conversation] = await Promise.all([
    getConversations(""),// Pass an empty string as query
    getConversationMessages(id), // Use id instead of params.id
    prisma.conversation.findUnique({
      where: { id }, // Use id instead of params.id
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!messagesResult.success || !conversation) {
    redirect("/dashboard/messages");
  }

  const otherParticipants = conversation.participants.filter(
    (p) => p.userId !== session?.user?.id
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="lg:hidden mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/messages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="hidden lg:block lg:col-span-1">
          <Suspense fallback={<div>Loading...</div>}>
            {conversationsResult.success && conversationsResult.data?.conversations && (
              <ConversationList
                conversations={conversationsResult.data.conversations}
                activeConversationId={id} // Use id instead of params.id
              />
            )}
          </Suspense>
        </div>
        <div className="lg:col-span-2 flex flex-col h-[calc(100vh-12rem)] border rounded-lg bg-background">
          <ConversationHeader
            conversationId={id} // Use id instead of params.id
            participants={otherParticipants}
            subject={conversation.subject}
          />
          <div className="flex-1 overflow-hidden">
            <MessageThread
              conversationId={id} // Use id instead of params.id
              initialMessages={messagesResult.data?.messages || []}
              currentUserId={session.user.id}
            />
          </div>
          <MessageInput conversationId={id} /> {/* Use id instead of params.id */}
        </div>
      </div>
    </div>
  );
}