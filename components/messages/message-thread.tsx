// components/messages/message-thread.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { markConversationAsRead } from "@/actions/messages";
import { CheckCheck } from "lucide-react";

interface Sender {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatar: string | null;
  role?: string;
}

interface ReplyTo {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string | null;
  };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string | null;
  sender: Sender;
  replyTo?: ReplyTo | null;
  attachments?: string[];
}

interface Props {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string | undefined;
}

export default function MessageThread({ 
  conversationId, 
  initialMessages, 
  currentUserId 
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  useEffect(() => {
    markConversationAsRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [initialMessages]);

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const shouldShowDateDivider = (currentMsg: Message, previousMsg?: Message) => {
    if (!previousMsg) return true;
    return !isSameDay(new Date(currentMsg.createdAt), new Date(previousMsg.createdAt));
  };

  const shouldShowAvatar = (currentMsg: Message, nextMsg?: Message) => {
    if (!nextMsg) return true;
    if (nextMsg.sender.id !== currentMsg.sender.id) return true;
    
    const timeDiff = new Date(nextMsg.createdAt).getTime() - new Date(currentMsg.createdAt).getTime();
    return timeDiff > 60000;
  };

  return (
    <ScrollArea ref={scrollRef} className="h-full bg-linear-to-b from-background to-muted/10">
      <div className="px-6 py-6 space-y-1 max-w-4xl mx-auto">
        {initialMessages.map((message, index) => {
          const isOwnMessage = message.sender.id === currentUserId;
          const previousMessage = index > 0 ? initialMessages[index - 1] : undefined;
          const nextMessage = index < initialMessages.length - 1 ? initialMessages[index + 1] : undefined;
          const showDateDivider = shouldShowDateDivider(message, previousMessage);
          const showAvatar = shouldShowAvatar(message, nextMessage);
          const isConsecutive = previousMessage?.sender.id === message.sender.id && !showDateDivider;

          return (
            <div key={message.id}>
              {showDateDivider && (
                <div className="flex items-center justify-center my-8">
                  <div className="bg-background border shadow-sm px-4 py-1.5 rounded-full text-xs font-medium text-muted-foreground">
                    {formatDateDivider(message.createdAt)}
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "flex gap-2 group",
                  isOwnMessage ? "flex-row-reverse" : "flex-row",
                  isConsecutive ? "mt-1" : "mt-6"
                )}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {/* Avatar */}
                <div className="shrink-0 w-9">
                  {!isOwnMessage && showAvatar ? (
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                      <AvatarImage 
                        src={message.sender.image || message.sender.avatar || undefined} 
                      />
                      <AvatarFallback className="text-xs bg-linear-to-br from-blue-500 to-purple-500 text-white font-semibold">
                        {message.sender.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : !isOwnMessage ? (
                    <div className="w-9" />
                  ) : null}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    "flex flex-col max-w-[70%] space-y-1",
                    isOwnMessage ? "items-end" : "items-start"
                  )}
                >
                  {/* Sender name */}
                  {!isOwnMessage && !isConsecutive && (
                    <span className="text-xs font-semibold text-muted-foreground px-3">
                      {message.sender.name}
                    </span>
                  )}

                  {/* Reply preview */}
                  {message.replyTo && (
                    <div className={cn(
                      "px-3 py-2 text-xs rounded-xl border-l-4 max-w-full backdrop-blur-sm",
                      isOwnMessage 
                        ? "bg-primary/10 border-primary" 
                        : "bg-muted/50 border-muted-foreground/50"
                    )}>
                      <p className="font-bold text-[10px] uppercase tracking-wider opacity-70">
                        {message.replyTo.sender.name}
                      </p>
                      <p className="text-muted-foreground truncate mt-1 leading-tight">
                        {message.replyTo.content}
                      </p>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={cn(
                      "relative px-4 py-2.5 rounded-2xl transition-all duration-200",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-background border shadow-sm",
                      isOwnMessage && "rounded-br-sm",
                      !isOwnMessage && "rounded-bl-sm",
                      hoveredMessageId === message.id && "shadow-lg scale-[1.01]"
                    )}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap wrap-break-word">
                      {message.content}
                    </p>
                    
                    {/* Timestamp and status */}
                    <div className={cn(
                      "flex items-center gap-1.5 mt-1.5 text-[11px]",
                      isOwnMessage 
                        ? "text-primary-foreground/70 justify-end" 
                        : "text-muted-foreground"
                    )}>
                      <span>{formatMessageDate(message.createdAt)}</span>
                      {message.isEdited && <span>• edited</span>}
                      {isOwnMessage && (
                        <CheckCheck className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}