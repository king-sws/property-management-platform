/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/maintenance.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, TicketPriority, TicketStatus } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";

// -------------------------
// Validation Schemas
// -------------------------
const createTicketSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  location: z.string().optional(),
});

const updateTicketSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "WAITING_VENDOR",
    "WAITING_PARTS",
    "SCHEDULED",
    "COMPLETED",
    "CANCELLED",
  ]).optional(),
  location: z.string().optional(),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  assignedToId: z.string().optional(),
  vendorId: z.string().optional(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
});

const addTicketUpdateSchema = z.object({
  message: z.string().min(1, "Message is required"),
  isInternal: z.boolean().default(false),
});

// -------------------------
// Types
// -------------------------
type TicketResult = {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
};

// -------------------------
// Helper Functions
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
      tenantProfile: true,
      vendorProfile: true,
    },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

function serializeTicket(ticket: any) {
  return {
    ...ticket,
    estimatedCost: ticket.estimatedCost ? Number(ticket.estimatedCost) : null,
    actualCost: ticket.actualCost ? Number(ticket.actualCost) : null,
    scheduledDate: ticket.scheduledDate?.toISOString() || null,
    completedDate: ticket.completedDate?.toISOString() || null,
    createdAt: ticket.createdAt?.toISOString() || null,
    updatedAt: ticket.updatedAt?.toISOString() || null,
    deletedAt: ticket.deletedAt?.toISOString() || null,
    property: ticket.property ? {
      ...ticket.property,
      latitude: ticket.property.latitude ? Number(ticket.property.latitude) : null,
      longitude: ticket.property.longitude ? Number(ticket.property.longitude) : null,
      purchasePrice: ticket.property.purchasePrice ? Number(ticket.property.purchasePrice) : null,
      currentValue: ticket.property.currentValue ? Number(ticket.property.currentValue) : null,
      propertyTax: ticket.property.propertyTax ? Number(ticket.property.propertyTax) : null,
      insurance: ticket.property.insurance ? Number(ticket.property.insurance) : null,
      hoaFees: ticket.property.hoaFees ? Number(ticket.property.hoaFees) : null,
      squareFeet: ticket.property.squareFeet ? Number(ticket.property.squareFeet) : null,
      lotSize: ticket.property.lotSize ? Number(ticket.property.lotSize) : null,
      createdAt: ticket.property.createdAt?.toISOString() || null,
      updatedAt: ticket.property.updatedAt?.toISOString() || null,
      deletedAt: ticket.property.deletedAt?.toISOString() || null,
    } : null,
    createdBy: ticket.createdBy ? {
      ...ticket.createdBy,
      createdAt: ticket.createdBy.createdAt?.toISOString() || null,
      updatedAt: ticket.createdBy.updatedAt?.toISOString() || null,
    } : null,
    assignedTo: ticket.assignedTo ? {
      ...ticket.assignedTo,
      createdAt: ticket.assignedTo.createdAt?.toISOString() || null,
      updatedAt: ticket.assignedTo.updatedAt?.toISOString() || null,
    } : null,
    vendor: ticket.vendor ? {
      ...ticket.vendor,
      rating: ticket.vendor.rating ? Number(ticket.vendor.rating) : null,
      createdAt: ticket.vendor.createdAt?.toISOString() || null,
      updatedAt: ticket.vendor.updatedAt?.toISOString() || null,
      deletedAt: ticket.vendor.deletedAt?.toISOString() || null,
    } : null,
    images: ticket.images ? ticket.images.map((img: any) => ({
      ...img,
      createdAt: img.createdAt?.toISOString() || null,
    })) : [],
    updates: ticket.updates ? ticket.updates.map((update: any) => ({
      ...update,
      createdAt: update.createdAt?.toISOString() || null,
    })) : [],
    appointments: ticket.appointments ? ticket.appointments.map((appt: any) => ({
      ...appt,
      scheduledStart: appt.scheduledStart?.toISOString() || null,
      scheduledEnd: appt.scheduledEnd?.toISOString() || null,
      actualStart: appt.actualStart?.toISOString() || null,
      actualEnd: appt.actualEnd?.toISOString() || null,
      createdAt: appt.createdAt?.toISOString() || null,
      updatedAt: appt.updatedAt?.toISOString() || null,
    })) : [],
  };
}

// -------------------------
// Create Ticket
// -------------------------
export async function createMaintenanceTicket(
  data: z.infer<typeof createTicketSchema>
): Promise<TicketResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const validated = createTicketSchema.parse(data);
    
    // Verify property exists and user has access
    const property = await prisma.property.findUnique({
      where: { id: validated.propertyId },
      include: {
        landlord: true,
      },
    });
    
    if (!property || property.deletedAt) {
      return {
        success: false,
        error: "Property not found",
      };
    }
    
    // Check authorization
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      property.landlordId === currentUser.landlordProfile?.id;
    
    const isTenant = currentUser.role === "TENANT";
    const isVendor = currentUser.role === "VENDOR";
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isLandlord && !isTenant && !isVendor && !isAdmin) {
      return {
        success: false,
        error: "You don't have permission to create tickets for this property",
      };
    }
    
    // Create ticket
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.maintenanceTicket.create({
        data: {
          propertyId: validated.propertyId,
          createdById: currentUser.id,
          title: validated.title,
          description: validated.description,
          category: validated.category,
          priority: validated.priority as TicketPriority,
          status: "OPEN" as TicketStatus,
          location: validated.location,
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "TICKET_CREATED" as ActivityType,
          action: `Created maintenance ticket: ${validated.title}`,
          metadata: {
            ticketId: newTicket.id,
            propertyId: validated.propertyId,
          },
        },
      });
      
      // Notify landlord if ticket created by tenant
      if (isTenant) {
        await tx.notification.create({
          data: {
            userId: property.landlord.userId,
            type: "MAINTENANCE_REQUEST",
            title: "New Maintenance Request",
            message: `New maintenance request: ${validated.title}`,
            actionUrl: `/dashboard/maintenance/${newTicket.id}`,
            metadata: {
              ticketId: newTicket.id,
            },
          },
        });
      }
      
      return newTicket;
    });
    
    const serializedTicket = serializeTicket(ticket);
    
    revalidatePath("/dashboard/maintenance");
    
    return {
      success: true,
      data: serializedTicket,
      message: "Maintenance ticket created successfully",
    };
  } catch (error) {
    console.error("Create ticket error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create ticket. Please try again.",
    };
  }
}

// -------------------------
// Get Tickets
// -------------------------
export async function getMaintenanceTickets(params?: {
  search?: string;
  status?: string;
  priority?: string;
  propertyId?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<TicketResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    
    const where: Prisma.MaintenanceTicketWhereInput = {
      deletedAt: null,
    };
    
    // Filter by user role
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.property = {
        landlordId: currentUser.landlordProfile.id,
      };
    } else if (currentUser.role === "TENANT" && currentUser.tenantProfile) {
      where.createdById = currentUser.id;
    } else if (currentUser.role === "VENDOR" && currentUser.vendorProfile) {
      where.OR = [
        { vendorId: currentUser.vendorProfile.id },
        { assignedToId: currentUser.id },
      ];
    }
    
    // Filter by property
    if (params?.propertyId) {
      where.propertyId = params.propertyId;
    }
    
    // Filter by status
    if (params?.status && params.status !== "ALL") {
      where.status = params.status as TicketStatus;
    }
    
    // Filter by priority
    if (params?.priority && params.priority !== "ALL") {
      where.priority = params.priority as TicketPriority;
    }
    
    // Filter by category
    if (params?.category && params.category !== "ALL") {
      where.category = params.category;
    }
    
    // Search filter
    if (params?.search) {
      where.OR = [
        {
          title: {
            contains: params.search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: params.search,
            mode: "insensitive",
          },
        },
        {
          property: {
            name: {
              contains: params.search,
              mode: "insensitive",
            },
          },
        },
      ];
    }
    
    const [tickets, total] = await Promise.all([
      prisma.maintenanceTicket.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              image: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          vendor: {
            select: {
              id: true,
              businessName: true,
              category: true,
            },
          },
          images: {
            orderBy: {
              order: "asc",
            },
            take: 3,
          },
        },
        skip,
        take: limit,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.maintenanceTicket.count({ where }),
    ]);
    
    const serializedTickets = tickets.map(serializeTicket);
    
    return {
      success: true,
      data: {
        tickets: serializedTickets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get tickets error:", error);
    return {
      success: false,
      error: "Failed to fetch tickets",
    };
  }
}

// -------------------------
// Get Ticket by ID
// -------------------------
export async function getMaintenanceTicketById(ticketId: string): Promise<TicketResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        property: {
          include: {
            landlord: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            image: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vendor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        images: {
          orderBy: {
            order: "asc",
          },
        },
        updates: {
          orderBy: {
            createdAt: "desc",
          },
        },
        appointments: {
          include: {
            vendor: {
              select: {
                id: true,
                businessName: true,
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: {
            scheduledStart: "desc",
          },
        },
      },
    });
    
    if (!ticket || ticket.deletedAt) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }
    
    // Check authorization
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      ticket.property.landlordId === currentUser.landlordProfile?.id;
    
    const isCreator = ticket.createdById === currentUser.id;
    
    const isAssignee =
      ticket.assignedToId === currentUser.id ||
      ticket.vendorId === currentUser.vendorProfile?.id;
    
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isLandlord && !isCreator && !isAssignee && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const serializedTicket = serializeTicket(ticket);
    
    return {
      success: true,
      data: serializedTicket,
    };
  } catch (error) {
    console.error("Get ticket error:", error);
    return {
      success: false,
      error: "Failed to fetch ticket details",
    };
  }
}

// -------------------------
// Update Ticket
// -------------------------
export async function updateMaintenanceTicket(
  ticketId: string,
  data: z.infer<typeof updateTicketSchema>
): Promise<TicketResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        property: {
          include: {
            landlord: true, // ✅ Include landlord to access userId
          },
        },
      },
    });
    
    if (!ticket || ticket.deletedAt) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }
    
    // Check authorization
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      ticket.property.landlordId === currentUser.landlordProfile?.id;
    
    const isCreator = ticket.createdById === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isLandlord && !isCreator && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const validated = updateTicketSchema.parse(data);
    
    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceTicket.update({
        where: { id: ticketId },
        data: {
          ...(validated.title && { title: validated.title }),
          ...(validated.description && { description: validated.description }),
          ...(validated.category && { category: validated.category }),
          ...(validated.priority && { priority: validated.priority as TicketPriority }),
          ...(validated.status && { status: validated.status as TicketStatus }),
          ...(validated.location !== undefined && { location: validated.location }),
          ...(validated.estimatedCost !== undefined && { estimatedCost: validated.estimatedCost }),
          ...(validated.actualCost !== undefined && { actualCost: validated.actualCost }),
          ...(validated.assignedToId !== undefined && { assignedToId: validated.assignedToId }),
          ...(validated.vendorId !== undefined && { vendorId: validated.vendorId }),
          ...(validated.scheduledDate && { scheduledDate: new Date(validated.scheduledDate) }),
          ...(validated.notes !== undefined && { notes: validated.notes }),
          ...(validated.status === "COMPLETED" && { completedDate: new Date() }),
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "TICKET_UPDATED" as ActivityType,
          action: `Updated maintenance ticket: ${ticket.title}`,
          metadata: {
            ticketId: ticketId,
            updatedFields: Object.keys(validated),
          },
        },
      });

      if (validated.vendorId && validated.vendorId !== ticket.vendorId) {
    // Get the vendor to access their userId
    const vendor = await tx.vendor.findUnique({
      where: { id: validated.vendorId },
      select: { userId: true, businessName: true },
    });
    
    if (vendor) {
      await tx.notification.create({
        data: {
          userId: vendor.userId,
          type: "MAINTENANCE_ASSIGNED",
          title: "New Job Assigned",
          message: `You've been assigned to: ${ticket.title}`,
          actionUrl: `/dashboard/vendor/tickets`,
          metadata: {
            ticketId: ticketId,
            propertyId: ticket.propertyId,
          },
        },
      });
    }
  }
      
      // Notify on status change
       if (validated.status && validated.status !== ticket.status) {
        // Determine who to notify
        const notifyUserId =
          currentUser.id === ticket.createdById
            ? ticket.property.landlord.userId  // ✅ Get landlord's user ID
            : ticket.createdById;  // Already a user ID
        
        await tx.notification.create({
          data: {
            userId: notifyUserId,
            type:
              validated.status === "COMPLETED"
                ? "MAINTENANCE_COMPLETED"
                : validated.status === "SCHEDULED"
                ? "MAINTENANCE_SCHEDULED"
                : "MAINTENANCE_REQUEST",
            title: "Ticket Status Updated",
            message: `Ticket "${ticket.title}" status changed to ${validated.status}`,
            actionUrl: `/dashboard/maintenance/${ticketId}`,
            metadata: {
              ticketId: ticketId,
              status: validated.status,
            },
          },
        });
      }
      
      return updated;
    });
    
    const serializedTicket = serializeTicket(updatedTicket);
    
    revalidatePath("/dashboard/maintenance");
    revalidatePath(`/dashboard/maintenance/${ticketId}`);
    
    return {
      success: true,
      data: serializedTicket,
      message: "Ticket updated successfully",
    };
  } catch (error) {
    console.error("Update ticket error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update ticket. Please try again.",
    };
  }
}

// -------------------------
// Add Ticket Update
// -------------------------
export async function addTicketUpdate(
  ticketId: string,
  data: z.infer<typeof addTicketUpdateSchema>
): Promise<TicketResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        property: true,
      },
    });
    
    if (!ticket || ticket.deletedAt) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }
    
    // Check authorization
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      ticket.property.landlordId === currentUser.landlordProfile?.id;
    
    const isCreator = ticket.createdById === currentUser.id;
    const isAssignee = ticket.assignedToId === currentUser.id;
    const isVendor = ticket.vendorId === currentUser.vendorProfile?.id;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isLandlord && !isCreator && !isAssignee && !isVendor && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const validated = addTicketUpdateSchema.parse(data);
    
    const update = await prisma.ticketUpdate.create({
      data: {
        ticketId: ticketId,
        message: validated.message,
        isInternal: validated.isInternal,
      },
    });
    
    revalidatePath(`/dashboard/maintenance/${ticketId}`);
    
    return {
      success: true,
      data: {
        ...update,
        createdAt: update.createdAt.toISOString(),
      },
      message: "Update added successfully",
    };
  } catch (error) {
    console.error("Add ticket update error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to add update. Please try again.",
    };
  }
}

// -------------------------
// Delete Ticket
// -------------------------
export async function deleteMaintenanceTicket(ticketId: string): Promise<TicketResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        property: true,
      },
    });
    
    if (!ticket || ticket.deletedAt) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }
    
    // Only landlord or admin can delete
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      ticket.property.landlordId === currentUser.landlordProfile?.id;
    
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Only landlords can delete tickets",
      };
    }
    
    // Soft delete
    await prisma.$transaction(async (tx) => {
      await tx.maintenanceTicket.update({
        where: { id: ticketId },
        data: {
          deletedAt: new Date(),
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "TICKET_UPDATED" as ActivityType,
          action: `Deleted maintenance ticket: ${ticket.title}`,
          metadata: {
            ticketId: ticketId,
          },
        },
      });
    });
    
    revalidatePath("/dashboard/maintenance");
    
    return {
      success: true,
      message: "Ticket deleted successfully",
    };
  } catch (error) {
    console.error("Delete ticket error:", error);
    return {
      success: false,
      error: "Failed to delete ticket. Please try again.",
    };
  }
}

// -------------------------
// Get Ticket Statistics
// -------------------------
export async function getMaintenanceStatistics(): Promise<TicketResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const where: Prisma.MaintenanceTicketWhereInput = {
      deletedAt: null,
    };
    
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.property = {
        landlordId: currentUser.landlordProfile.id,
      };
    } else if (currentUser.role === "TENANT" && currentUser.tenantProfile) {
      where.createdById = currentUser.id;
    }
    
    const [total, open, inProgress, completed, urgent] = await Promise.all([
      prisma.maintenanceTicket.count({ where }),
      prisma.maintenanceTicket.count({
        where: { ...where, status: "OPEN" },
      }),
      prisma.maintenanceTicket.count({
        where: {
          ...where,
          status: {
            in: ["IN_PROGRESS", "WAITING_VENDOR", "WAITING_PARTS", "SCHEDULED"],
          },
        },
      }),
      prisma.maintenanceTicket.count({
        where: { ...where, status: "COMPLETED" },
      }),
      prisma.maintenanceTicket.count({
        where: { ...where, priority: "URGENT" },
      }),
    ]);
    
    return {
      success: true,
      data: {
        total,
        open,
        inProgress,
        completed,
        urgent,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      },
    };
  } catch (error) {
    console.error("Get maintenance statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}