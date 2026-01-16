// ============================================================================
// app/api/stats/unread-messages/route.ts
// ============================================================================
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get unread message count
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
            isArchived: false,
          },
        },
      },
      include: {
        participants: {
          where: { userId: session.user.id },
        },
        messages: {
          where: {
            senderId: { not: session.user.id },
            deletedAt: null,
          },
        },
      },
    });

    let unreadCount = 0;
    for (const conv of conversations) {
      const participant = conv.participants[0];
      const lastReadAt = participant?.lastReadAt || new Date(0);
      
      const unreadInConv = conv.messages.filter(
        (msg) => msg.createdAt > lastReadAt
      ).length;
      
      unreadCount += unreadInConv;
    }

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return NextResponse.json({ count: 0 }); // Return 0 on error
  }
}










