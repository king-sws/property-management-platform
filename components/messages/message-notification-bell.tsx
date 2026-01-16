// components/messages/message-notification-bell.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MessageNotification {
  id: string;
  conversationId: string;
  senderName: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export default function MessageNotificationBell() {
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Poll for new notifications every 30 seconds
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/messages/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (conversationId: string) => {
    router.push(`/dashboard/messages/${conversationId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-95">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Messages</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-100">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">No new messages</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="cursor-pointer p-3"
                  onClick={() => handleNotificationClick(notification.conversationId)}
                >
                  <div className="flex flex-col space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {notification.senderName}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/messages"
            className="w-full text-center cursor-pointer"
          >
            View all messages
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// app/api/messages/notifications/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          where: {
            userId: session.user.id,
          },
        },
        messages: {
          where: {
            senderId: { not: session.user.id },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          include: {
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate unread messages
    const notifications = [];
    let totalUnread = 0;

    for (const conversation of conversations) {
      const participant = conversation.participants[0];
      const unreadMessages = conversation.messages.filter(
        (msg) =>
          !participant?.lastReadAt ||
          new Date(msg.createdAt) > new Date(participant.lastReadAt)
      );

      totalUnread += unreadMessages.length;

      notifications.push(
        ...unreadMessages.map((msg) => ({
          id: msg.id,
          conversationId: conversation.id,
          senderName: msg.sender.name || "Unknown",
          content: msg.content,
          createdAt: msg.createdAt,
          isRead: false,
        }))
      );
    }

    return NextResponse.json({
      notifications: notifications.slice(0, 10),
      unreadCount: totalUnread,
    });
  } catch (error) {
    console.error("Failed to fetch message notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}