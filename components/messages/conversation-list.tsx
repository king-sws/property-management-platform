// components/messages/conversation-list.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatar: string | null;
  role: string;
}

interface Participant {
  user: User;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
  };
}

interface Conversation {
  id: string;
  subject?: string | null;
  lastMessageAt?: string | null;
  participants: Participant[];
  messages: Message[];
  unreadCount?: number;
}

interface Props {
  conversations: Conversation[];
  activeConversationId?: string;
}

export default function ConversationList({ conversations, activeConversationId }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg mb-4">Conversations</h2>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages[0];
            const otherParticipant = conversation.participants.find(
              (p) => p.user.id !== conversation.participants[0]?.user.id
            )?.user || conversation.participants[0]?.user;

            return (
              <Link
                key={conversation.id}
                href={`/dashboard/messages/${conversation.id}`}
                className={cn(
                  "block p-4 border rounded-lg hover:bg-accent transition-colors",
                  activeConversationId === conversation.id && "bg-accent border-primary"
                )}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherParticipant?.image || otherParticipant?.avatar || undefined} />
                    <AvatarFallback>
                      {otherParticipant?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate">
                        {conversation.subject || otherParticipant?.name || "Unknown"}
                      </p>
                      {conversation.unreadCount && conversation.unreadCount > 0 ? (
                        <Badge variant="default" className="ml-2">
                          {conversation.unreadCount}
                        </Badge>
                      ) : null}
                    </div>

                    {lastMessage && (
                      <>
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.sender.name}: {lastMessage.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

