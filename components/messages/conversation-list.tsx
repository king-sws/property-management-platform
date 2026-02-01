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
      <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Conversations</h2>
      <ScrollArea className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] lg:h-[calc(100vh-16rem)]">
        <div className="space-y-2 pr-2 sm:pr-4">
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
                  "block p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors",
                  activeConversationId === conversation.id && "bg-accent border-primary"
                )}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage src={otherParticipant?.image || otherParticipant?.avatar || undefined} />
                    <AvatarFallback className="text-sm">
                      {otherParticipant?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="font-semibold truncate text-sm sm:text-base">
                        {conversation.subject || otherParticipant?.name || "Unknown"}
                      </p>
                      {conversation.unreadCount && conversation.unreadCount > 0 ? (
                        <Badge variant="default" className="ml-auto flex-shrink-0 text-xs px-2 py-0">
                          {conversation.unreadCount}
                        </Badge>
                      ) : null}
                    </div>

                    {lastMessage && (
                      <>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          <span className="font-medium">{lastMessage.sender.name}:</span>{" "}
                          {lastMessage.content}
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