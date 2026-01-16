/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/messages.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NotificationType } from "@/lib/generated/prisma/enums";

// -------------------------
// Validation Schemas
// -------------------------
const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(1, "At least one participant is required"),
  subject: z.string().optional(),
  initialMessage: z.string().min(1, "Initial message is required"),
});

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, "Message cannot be empty").max(5000),
  attachments: z.array(z.string()).optional(),
  replyToId: z.string().optional(),
});

const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().min(1).max(5000),
});

// -------------------------
// Types
// -------------------------
type ActionResult = {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
};

// -------------------------
// Helper: Get Current User
// -------------------------
async function getCurrentUserWithRole() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      landlordProfile: true,
      tenantProfile: {
        include: {
          leaseMembers: {
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: {
                        include: {
                          landlord: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      vendorProfile: true,
    },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

// Helper to serialize conversation
function serializeConversation(conversation: any) {
  return {
    ...conversation,
    lastMessageAt: conversation.lastMessageAt?.toISOString() || null,
    createdAt: conversation.createdAt?.toISOString() || null,
    updatedAt: conversation.updatedAt?.toISOString() || null,
    participants: conversation.participants?.map((p: any) => ({
      ...p,
      lastReadAt: p.lastReadAt?.toISOString() || null,
      joinedAt: p.joinedAt?.toISOString() || null,
      user: p.user ? {
        ...p.user,
        createdAt: p.user.createdAt?.toISOString() || null,
        updatedAt: p.user.updatedAt?.toISOString() || null,
      } : null,
    })) || [],
    messages: conversation.messages?.map((m: any) => serializeMessage(m)) || [],
  };
}

// Helper to serialize message
function serializeMessage(message: any) {
  return {
    ...message,
    createdAt: message.createdAt?.toISOString() || null,
    updatedAt: message.updatedAt?.toISOString() || null,
    editedAt: message.editedAt?.toISOString() || null,
    deletedAt: message.deletedAt?.toISOString() || null,
    sender: message.sender ? {
      ...message.sender,
      createdAt: message.sender.createdAt?.toISOString() || null,
      updatedAt: message.sender.updatedAt?.toISOString() || null,
    } : null,
    replyTo: message.replyTo ? {
      ...message.replyTo,
      createdAt: message.replyTo.createdAt?.toISOString() || null,
      sender: message.replyTo.sender ? {
        ...message.replyTo.sender,
        createdAt: message.replyTo.sender.createdAt?.toISOString() || null,
      } : null,
    } : null,
  };
}

// -------------------------
// Create or Get Conversation
// -------------------------
export async function createConversation(
  participantIds: string[],
  subject?: string,
  initialMessage?: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    const validated = createConversationSchema.parse({
      participantIds,
      subject,
      initialMessage,
    });

    // Add current user to participants if not included
    const allParticipantIds = Array.from(
      new Set([currentUser.id, ...validated.participantIds])
    );

    // Check if conversation already exists with same participants (only for 1-on-1)
    if (allParticipantIds.length === 2) {
      const existingConversations = await prisma.conversation.findMany({
        where: {
          participants: {
            every: {
              userId: { in: allParticipantIds },
            },
          },
        },
        include: {
          participants: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      const matchingConversation = existingConversations.find(
        (conv) => conv.participants.length === allParticipantIds.length
      );

      if (matchingConversation) {
        return {
          success: true,
          data: { 
            conversationId: matchingConversation.id,
            conversation: serializeConversation(matchingConversation),
          },
        };
      }
    }

    // Create new conversation
    const conversation = await prisma.$transaction(async (tx) => {
      const newConversation = await tx.conversation.create({
        data: {
          subject: validated.subject,
          lastMessageAt: validated.initialMessage ? new Date() : undefined,
        },
      });

      // Create participants
      await tx.conversationParticipant.createMany({
        data: allParticipantIds.map((userId) => ({
          conversationId: newConversation.id,
          userId,
        })),
      });

      // Create initial message if provided
      if (validated.initialMessage) {
        await tx.message.create({
          data: {
            conversationId: newConversation.id,
            senderId: currentUser.id,
            content: validated.initialMessage,
          },
        });

        // Create notifications for other participants
        const otherParticipantIds = allParticipantIds.filter((id) => id !== currentUser.id);
        if (otherParticipantIds.length > 0) {
          await tx.notification.createMany({
            data: otherParticipantIds.map((userId) => ({
              userId,
              type: "MESSAGE" as NotificationType,
              title: "New Message",
              message: `${currentUser.name || "Someone"} sent you a message`,
              actionUrl: `/dashboard/messages/${newConversation.id}`,
              metadata: { conversationId: newConversation.id },
            })),
          });
        }
      }

      // Fetch complete conversation with relations
      const completeConversation = await tx.conversation.findUnique({
        where: { id: newConversation.id },
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
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return completeConversation;
    });

    revalidatePath("/dashboard/messages");

    return {
      success: true,
      data: { 
        conversationId: conversation!.id, 
        conversation: serializeConversation(conversation),
      },
      message: "Conversation created successfully",
    };
  } catch (error) {
    console.error("Create conversation error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    return {
      success: false,
      error: "Failed to create conversation",
    };
  }
}

// -------------------------
// Send Message
// -------------------------
export async function sendMessage(
  conversationId: string,
  content: string,
  attachments?: string[],
  replyToId?: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    const validated = sendMessageSchema.parse({
      conversationId,
      content,
      attachments,
      replyToId,
    });

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: validated.conversationId,
          userId: currentUser.id,
        },
      },
    });

    if (!participant) {
      return {
        success: false,
        error: "You are not a participant in this conversation",
      };
    }

    // Create message
    const message = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          conversationId: validated.conversationId,
          senderId: currentUser.id,
          content: validated.content,
          attachments: validated.attachments || [],
          replyToId: validated.replyToId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              avatar: true,
              role: true,
            },
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Update conversation lastMessageAt
      await tx.conversation.update({
        where: { id: validated.conversationId },
        data: { lastMessageAt: new Date() },
      });

      // Get other participants
      const otherParticipants = await tx.conversationParticipant.findMany({
        where: {
          conversationId: validated.conversationId,
          userId: { not: currentUser.id },
        },
      });

      // Create notifications
      if (otherParticipants.length > 0) {
        await tx.notification.createMany({
          data: otherParticipants.map((p: { userId: any; }) => ({
            userId: p.userId,
            type: "MESSAGE" as NotificationType,
            title: "New Message",
            message: `${currentUser.name || "Someone"}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
            actionUrl: `/dashboard/messages/${validated.conversationId}`,
            metadata: {
              conversationId: validated.conversationId,
              messageId: newMessage.id,
            },
          })),
        });
      }

      return newMessage;
    });

    revalidatePath(`/dashboard/messages/${validated.conversationId}`);
    revalidatePath("/dashboard/messages");

    return {
      success: true,
      data: { message: serializeMessage(message) },
      message: "Message sent successfully",
    };
  } catch (error) {
    console.error("Send message error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    return {
      success: false,
      error: "Failed to send message",
    };
  }
}

// -------------------------
// Get Conversations
// -------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getConversations(_query: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUser.id,
            isArchived: false,
          },
        },
      },
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === currentUser.id);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: currentUser.id },
            createdAt: {
              gt: participant?.lastReadAt || new Date(0),
            },
            deletedAt: null,
          },
        });

        return {
          ...serializeConversation(conv),
          unreadCount,
        };
      })
    );

    return {
      success: true,
      data: { conversations: conversationsWithUnread },
    };
  } catch (error) {
    console.error("Get conversations error:", error);
    return {
      success: false,
      error: "Failed to fetch conversations",
    };
  }
}

// -------------------------
// Get Conversation Messages
// -------------------------
export async function getConversationMessages(
  conversationId: string,
  cursor?: string,
  limit: number = 50
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();

    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
    });

    if (!participant) {
      return {
        success: false,
        error: "You are not a participant in this conversation",
      };
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            avatar: true,
            role: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update last read timestamp
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    const serializedMessages = messages.map(serializeMessage).reverse();

    return {
      success: true,
      data: {
        messages: serializedMessages,
        hasMore: messages.length === limit,
        nextCursor: messages.length === limit ? messages[0]?.id : null,
      },
    };
  } catch (error) {
    console.error("Get messages error:", error);
    return {
      success: false,
      error: "Failed to fetch messages",
    };
  }
}

// -------------------------
// Mark as Read
// -------------------------
export async function markConversationAsRead(
  conversationId: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/messages/${conversationId}`);
    revalidatePath("/dashboard/messages");

    return { success: true };
  } catch (error) {
    console.error("Mark as read error:", error);
    return {
      success: false,
      error: "Failed to mark conversation as read",
    };
  }
}

// -------------------------
// Archive Conversation
// -------------------------
export async function archiveConversation(
  conversationId: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
      data: {
        isArchived: true,
      },
    });

    revalidatePath("/dashboard/messages");

    return { 
      success: true,
      message: "Conversation archived successfully",
    };
  } catch (error) {
    console.error("Archive conversation error:", error);
    return {
      success: false,
      error: "Failed to archive conversation",
    };
  }
}

// -------------------------
// Update Message
// -------------------------
export async function updateMessage(
  messageId: string,
  content: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    const validated = updateMessageSchema.parse({ messageId, content });

    // Verify ownership
    const message = await prisma.message.findUnique({
      where: { id: validated.messageId },
      select: { senderId: true, conversationId: true },
    });

    if (!message || message.senderId !== currentUser.id) {
      return {
        success: false,
        error: "You can only edit your own messages",
      };
    }

    const updatedMessage = await prisma.message.update({
      where: { id: validated.messageId },
      data: {
        content: validated.content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            avatar: true,
          },
        },
      },
    });

    revalidatePath(`/dashboard/messages/${message.conversationId}`);

    return {
      success: true,
      data: { message: serializeMessage(updatedMessage) },
      message: "Message updated successfully",
    };
  } catch (error) {
    console.error("Update message error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    return {
      success: false,
      error: "Failed to update message",
    };
  }
}

// -------------------------
// Delete Message
// -------------------------
export async function deleteMessage(messageId: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();

    // Verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true, conversationId: true },
    });

    if (!message || message.senderId !== currentUser.id) {
      return {
        success: false,
        error: "You can only delete your own messages",
      };
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
        content: "This message has been deleted",
      },
    });

    revalidatePath(`/dashboard/messages/${message.conversationId}`);

    return { 
      success: true,
      message: "Message deleted successfully",
    };
  } catch (error) {
    console.error("Delete message error:", error);
    return {
      success: false,
      error: "Failed to delete message",
    };
  }
}

// -------------------------
// Search Conversations
// -------------------------
export async function searchConversations(query: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();

    if (!query || query.length < 2) {
      return {
        success: false,
        error: "Search query must be at least 2 characters",
      };
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUser.id,
          },
        },
        OR: [
          {
            subject: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            messages: {
              some: {
                content: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
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
        messages: {
          where: {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
          take: 3,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      take: 20,
    });

    return {
      success: true,
      data: { conversations: conversations.map(serializeConversation) },
    };
  } catch (error) {
    console.error("Search conversations error:", error);
    return {
      success: false,
      error: "Failed to search conversations",
    };
  }
}

// -------------------------
// Get Available Contacts
// -------------------------
export async function getAvailableContacts(): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    let contacts: any[] = [];

    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      // Landlord can message tenants and vendors
      const [tenants, vendors] = await Promise.all([
        prisma.user.findMany({
          where: {
            role: "TENANT",
            tenantProfile: {
              leaseMembers: {
                some: {
                  lease: {
                    unit: {
                      property: {
                        landlordId: currentUser.landlordProfile.id,
                      },
                    },
                  },
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            avatar: true,
            role: true,
          },
        }),
        prisma.user.findMany({
          where: {
            role: "VENDOR",
            vendorProfile: {
              tickets: {
                some: {
                  property: {
                    landlordId: currentUser.landlordProfile.id,
                  },
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            avatar: true,
            role: true,
          },
        }),
      ]);

      contacts = [...tenants, ...vendors];
    } else if (currentUser.role === "TENANT" && currentUser.tenantProfile) {
      // Tenant can message their landlords
      const landlordIds = new Set(
        currentUser.tenantProfile.leaseMembers
          .map((lm) => lm.lease.unit.property.landlord.userId)
      );

      if (landlordIds.size > 0) {
        contacts = await prisma.user.findMany({
          where: {
            id: { in: Array.from(landlordIds) },
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            avatar: true,
            role: true,
          },
        });
      }
    } else if (currentUser.role === "VENDOR" && currentUser.vendorProfile) {
      // Vendor can message landlords they've worked with
      contacts = await prisma.user.findMany({
        where: {
          role: "LANDLORD",
          landlordProfile: {
            properties: {
              some: {
                maintenanceTickets: {
                  some: {
                    vendorId: currentUser.vendorProfile.id,
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          avatar: true,
          role: true,
        },
      });
    }

    return {
      success: true,
      data: { contacts },
    };
  } catch (error) {
    console.error("Get contacts error:", error);
    return {
      success: false,
      error: "Failed to fetch contacts",
    };
  }
}