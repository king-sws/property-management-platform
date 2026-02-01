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
import { Container, Stack } from "@/components/ui/container";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  // Await params to get the id
  const { id } = await params;

  const [conversationsResult, messagesResult, conversation] = await Promise.all([
    getConversations(""),
    getConversationMessages(id),
    prisma.conversation.findUnique({
      where: { id },
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
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Back button for mobile */}
        <div className="lg:hidden">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/messages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Link>
          </Button>
        </div>

        {/* Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hidden lg:block lg:col-span-1">
            <Suspense fallback={<div>Loading...</div>}>
              {conversationsResult.success && conversationsResult.data?.conversations && (
                <ConversationList
                  conversations={conversationsResult.data.conversations}
                  activeConversationId={id}
                />
              )}
            </Suspense>
          </div>

          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-12rem)] border rounded-lg bg-background">
            <ConversationHeader
              conversationId={id}
              participants={otherParticipants}
              subject={conversation.subject}
            />
            <div className="flex-1 overflow-hidden">
              <MessageThread
                conversationId={id}
                initialMessages={messagesResult.data?.messages || []}
                currentUserId={session.user.id}
              />
            </div>
            <MessageInput conversationId={id} />
          </div>
        </div>
      </Stack>
    </Container>
  );
}