/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/maintenance-improved.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, TicketStatus } from "@/lib/generated/prisma/enums";

// NEW: Vendor Response Schema
const vendorResponseSchema = z.object({
  accept: z.boolean(),
  estimatedCost: z.number().optional(),
  availableDate: z.string().optional(),
  notes: z.string().optional(),
});

// NEW: Schedule Appointment from Ticket
const scheduleAppointmentSchema = z.object({
  scheduledStart: z.string().min(1, "Start time is required"),
  scheduledEnd: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
});

type MaintenanceResult = {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
};

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

/**
 * IMPROVED: Assign vendor with pending status
 * Vendor must accept before work begins
 */
export async function assignVendorToTicket(
  ticketId: string,
  vendorId: string
): Promise<MaintenanceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    // Only landlords can assign vendors
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can assign vendors",
      };
    }
    
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        property: {
          include: {
            landlord: true,
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
    
    // Verify landlord owns the property
    if (ticket.property.landlordId !== currentUser.landlordProfile?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: true },
    });
    
    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found",
      };
    }
    
    // Update ticket with WAITING_VENDOR status
    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceTicket.update({
        where: { id: ticketId },
        data: {
          vendorId: vendorId,
          assignedToId: vendor.userId,
          status: "WAITING_VENDOR" as TicketStatus, // NEW: Pending vendor acceptance
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "TICKET_UPDATED" as ActivityType,
          action: `Assigned vendor ${vendor.businessName} to ticket`,
          metadata: {
            ticketId: ticketId,
            vendorId: vendorId,
          },
        },
      });
      
      // Notify vendor
      await tx.notification.create({
        data: {
          userId: vendor.userId,
          type: "MAINTENANCE_ASSIGNED",
          title: "New Job Assignment",
          message: `You've been assigned to: ${ticket.title}. Please review and accept or decline.`,
          actionUrl: `/dashboard/maintenance/${ticketId}`,
          metadata: {
            ticketId: ticketId,
            propertyId: ticket.propertyId,
            requiresAction: true, // NEW: Requires vendor action
          },
        },
      });
      
      return updated;
    });
    
    revalidatePath("/dashboard/maintenance");
    revalidatePath(`/dashboard/maintenance/${ticketId}`);
    
    return {
      success: true,
      data: updatedTicket,
      message: "Vendor assigned. Waiting for vendor acceptance.",
    };
  } catch (error) {
    console.error("Assign vendor error:", error);
    return {
      success: false,
      error: "Failed to assign vendor",
    };
  }
}

/**
 * NEW: Vendor accepts or rejects ticket assignment
 */
export async function respondToTicketAssignment(
  ticketId: string,
  data: z.infer<typeof vendorResponseSchema>
): Promise<MaintenanceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "VENDOR") {
      return {
        success: false,
        error: "Only vendors can respond to assignments",
      };
    }
    
    const validated = vendorResponseSchema.parse(data);
    
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        property: {
          include: {
            landlord: true,
          },
        },
        vendor: true,
      },
    });
    
    if (!ticket) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }
    
    // Verify vendor is assigned to this ticket
    if (ticket.vendorId !== currentUser.vendorProfile?.id) {
      return {
        success: false,
        error: "You are not assigned to this ticket",
      };
    }
    
    if (ticket.status !== "WAITING_VENDOR") {
      return {
        success: false,
        error: "This ticket is no longer awaiting your response",
      };
    }
    
    const result = await prisma.$transaction(async (tx) => {
      if (validated.accept) {
        // ACCEPT: Move to IN_PROGRESS
        const updated = await tx.maintenanceTicket.update({
          where: { id: ticketId },
          data: {
            status: "IN_PROGRESS" as TicketStatus,
            estimatedCost: validated.estimatedCost,
            notes: validated.notes,
          },
        });
        
        // Notify landlord of acceptance
        await tx.notification.create({
          data: {
            userId: ticket.property.landlord.userId,
            type: "MAINTENANCE_REQUEST",
            title: "Vendor Accepted Job",
            message: `${ticket.vendor?.businessName} accepted the job: ${ticket.title}${validated.estimatedCost ? `. Estimated cost: $${validated.estimatedCost}` : ''}`,
            actionUrl: `/dashboard/maintenance/${ticketId}`,
            metadata: {
              ticketId: ticketId,
              accepted: true,
            },
          },
        });
        
        return { updated, accepted: true };
      } else {
        // REJECT: Unassign vendor and return to OPEN
        const updated = await tx.maintenanceTicket.update({
          where: { id: ticketId },
          data: {
            status: "OPEN" as TicketStatus,
            vendorId: null,
            assignedToId: null,
          },
        });
        
        // Notify landlord of rejection
        await tx.notification.create({
          data: {
            userId: ticket.property.landlord.userId,
            type: "MAINTENANCE_REQUEST",
            title: "Vendor Declined Job",
            message: `${ticket.vendor?.businessName} declined the job: ${ticket.title}${validated.notes ? `. Reason: ${validated.notes}` : ''}`,
            actionUrl: `/dashboard/maintenance/${ticketId}`,
            metadata: {
              ticketId: ticketId,
              accepted: false,
            },
          },
        });
        
        return { updated, accepted: false };
      }
    });
    
    revalidatePath("/dashboard/maintenance");
    revalidatePath(`/dashboard/maintenance/${ticketId}`);
    
    return {
      success: true,
      data: result.updated,
      message: result.accepted 
        ? "Job accepted successfully" 
        : "Job declined. Landlord has been notified.",
    };
  } catch (error) {
    console.error("Respond to assignment error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to respond to assignment",
    };
  }
}

/**
 * NEW: Quick schedule appointment from ticket (landlord only)
 * This creates an appointment when changing status to SCHEDULED
 */
export async function scheduleAppointmentForTicket(
  ticketId: string,
  data: z.infer<typeof scheduleAppointmentSchema>
): Promise<MaintenanceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can schedule appointments",
      };
    }
    
    const validated = scheduleAppointmentSchema.parse(data);
    
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        property: {
          include: {
            landlord: true,
          },
        },
        vendor: {
          include: {
            user: true,
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
    
    if (!ticket.vendorId) {
      return {
        success: false,
        error: "No vendor assigned to this ticket",
      };
    }
    
    const scheduledStart = new Date(validated.scheduledStart);
    const scheduledEnd = new Date(validated.scheduledEnd);
    
    if (scheduledStart >= scheduledEnd) {
      return {
        success: false,
        error: "End time must be after start time",
      };
    }
    
    // Check for conflicts
    const conflicts = await prisma.serviceAppointment.findMany({
      where: {
        vendorId: ticket.vendorId,
        status: {
          in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
        },
        OR: [
          {
            AND: [
              { scheduledStart: { lte: scheduledStart } },
              { scheduledEnd: { gt: scheduledStart } },
            ],
          },
          {
            AND: [
              { scheduledStart: { lt: scheduledEnd } },
              { scheduledEnd: { gte: scheduledEnd } },
            ],
          },
        ],
      },
    });
    
    if (conflicts.length > 0) {
      return {
        success: false,
        error: "Vendor has a conflicting appointment at this time",
      };
    }
    
    // Create appointment and update ticket
    const result = await prisma.$transaction(async (tx) => {
      const appointment = await tx.serviceAppointment.create({
        data: {
          ticketId: ticketId,
          vendorId: ticket.vendorId!,
          scheduledStart: scheduledStart,
          scheduledEnd: scheduledEnd,
          status: "SCHEDULED",
          notes: validated.notes,
        },
      });
      
      const updatedTicket = await tx.maintenanceTicket.update({
        where: { id: ticketId },
        data: {
          status: "SCHEDULED" as TicketStatus,
          scheduledDate: scheduledStart,
        },
      });
      
      // Notify vendor
      await tx.notification.create({
        data: {
          userId: ticket.vendor!.userId,
          type: "MAINTENANCE_SCHEDULED",
          title: "Appointment Scheduled",
          message: `Appointment scheduled for ${scheduledStart.toLocaleDateString()} at ${scheduledStart.toLocaleTimeString()}: ${ticket.title}`,
          actionUrl: `/dashboard/vendor/schedule`,
          metadata: {
            appointmentId: appointment.id,
            ticketId: ticketId,
          },
        },
      });
      
      return { appointment, updatedTicket };
    });
    
    revalidatePath("/dashboard/maintenance");
    revalidatePath(`/dashboard/maintenance/${ticketId}`);
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/vendor/schedule");
    
    return {
      success: true,
      data: result,
      message: "Appointment scheduled successfully",
    };
  } catch (error) {
    console.error("Schedule appointment error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to schedule appointment",
    };
  }
}

/**
 * NEW: Get vendor's availability and active jobs
 */
export async function getVendorAvailability(
  vendorId: string,
  date: string
): Promise<MaintenanceResult> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const appointments = await prisma.serviceAppointment.findMany({
      where: {
        vendorId: vendorId,
        scheduledStart: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
        },
      },
      orderBy: {
        scheduledStart: "asc",
      },
    });
    
    const activeTickets = await prisma.maintenanceTicket.count({
      where: {
        vendorId: vendorId,
        status: {
          in: ["IN_PROGRESS", "SCHEDULED"],
        },
      },
    });
    
    return {
      success: true,
      data: {
        appointments,
        activeTickets,
        isAvailable: appointments.length === 0,
      },
    };
  } catch (error) {
    console.error("Get vendor availability error:", error);
    return {
      success: false,
      error: "Failed to check availability",
    };
  }
}