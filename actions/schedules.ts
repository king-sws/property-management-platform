/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/schedules.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";

// -------------------------
// Validation Schemas
// -------------------------
const createAppointmentSchema = z.object({
  ticketId: z.string().optional().nullable(),
  vendorId: z.string().min(1, "Vendor is required"),
  scheduledStart: z.string().min(1, "Start time is required"),
  scheduledEnd: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  actualStart: z.string().optional(),
  actualEnd: z.string().optional(),
  notes: z.string().optional(),
});

// -------------------------
// Types
// -------------------------
type ScheduleResult = {
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

function serializeAppointment(appointment: any) {
  return {
    ...appointment,
    scheduledStart: appointment.scheduledStart?.toISOString() || null,
    scheduledEnd: appointment.scheduledEnd?.toISOString() || null,
    actualStart: appointment.actualStart?.toISOString() || null,
    actualEnd: appointment.actualEnd?.toISOString() || null,
    createdAt: appointment.createdAt?.toISOString() || null,
    updatedAt: appointment.updatedAt?.toISOString() || null,
    ticket: appointment.ticket ? {
      ...appointment.ticket,
      estimatedCost: appointment.ticket.estimatedCost ? Number(appointment.ticket.estimatedCost) : null,
      actualCost: appointment.ticket.actualCost ? Number(appointment.ticket.actualCost) : null,
      createdAt: appointment.ticket.createdAt?.toISOString() || null,
      property: appointment.ticket.property ? {
        ...appointment.ticket.property,
        latitude: appointment.ticket.property.latitude ? Number(appointment.ticket.property.latitude) : null,
        longitude: appointment.ticket.property.longitude ? Number(appointment.ticket.property.longitude) : null,
        purchasePrice: appointment.ticket.property.purchasePrice ? Number(appointment.ticket.property.purchasePrice) : null,
        currentValue: appointment.ticket.property.currentValue ? Number(appointment.ticket.property.currentValue) : null,
        propertyTax: appointment.ticket.property.propertyTax ? Number(appointment.ticket.property.propertyTax) : null,
        insurance: appointment.ticket.property.insurance ? Number(appointment.ticket.property.insurance) : null,
        hoaFees: appointment.ticket.property.hoaFees ? Number(appointment.ticket.property.hoaFees) : null,
        createdAt: appointment.ticket.property.createdAt?.toISOString() || null,
        updatedAt: appointment.ticket.property.updatedAt?.toISOString() || null,
      } : null,
    } : null,
    vendor: appointment.vendor ? {
      ...appointment.vendor,
      rating: appointment.vendor.rating ? Number(appointment.vendor.rating) : null,
      createdAt: appointment.vendor.createdAt?.toISOString() || null,
    } : null,
  };
}

// -------------------------
// Create Appointment
// -------------------------
export async function createAppointment(
  data: z.infer<typeof createAppointmentSchema>
): Promise<ScheduleResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    // Only landlords, vendors, and admins can create appointments
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "VENDOR" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized to create appointments",
      };
    }
    
    const validated = createAppointmentSchema.parse(data);
    
    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: validated.vendorId },
      include: {
        user: true,
      },
    });
    
    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found",
      };
    }
    
    // If ticket provided, verify it exists and vendor is assigned
    let ticket = null;
    if (validated.ticketId) {
      ticket = await prisma.maintenanceTicket.findUnique({
        where: { id: validated.ticketId },
        include: {
          property: {
            include: {
              landlord: true,
            },
          },
        },
      });
      
      if (!ticket) {
        return {
          success: false,
          error: "Ticket not found",
        };
      }
      
      // Check if landlord owns the property
      if (currentUser.role === "LANDLORD" && ticket.property.landlordId !== currentUser.landlordProfile?.id) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }
    }
    
    // Check for scheduling conflicts
    const scheduledStart = new Date(validated.scheduledStart);
    const scheduledEnd = new Date(validated.scheduledEnd);
    
    if (scheduledStart >= scheduledEnd) {
      return {
        success: false,
        error: "End time must be after start time",
      };
    }
    
    const conflicts = await prisma.serviceAppointment.findMany({
      where: {
        vendorId: validated.vendorId,
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
          {
            AND: [
              { scheduledStart: { gte: scheduledStart } },
              { scheduledEnd: { lte: scheduledEnd } },
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
    
    // Create appointment
    const appointment = await prisma.$transaction(async (tx) => {
      const newAppointment = await tx.serviceAppointment.create({
        data: {
          ticketId: validated.ticketId,
          vendorId: validated.vendorId,
          scheduledStart: scheduledStart,
          scheduledEnd: scheduledEnd,
          status: "SCHEDULED",
          notes: validated.notes,
        },
        include: {
          vendor: {
            include: {
              user: true,
            },
          },
          ticket: {
            include: {
              property: true,
            },
          },
        },
      });
      
      // Update ticket status if applicable
      if (validated.ticketId) {
        await tx.maintenanceTicket.update({
          where: { id: validated.ticketId },
          data: {
            status: "SCHEDULED",
            scheduledDate: scheduledStart,
          },
        });
      }
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_CREATED" as ActivityType,
          action: `Created appointment with ${vendor.businessName}`,
          metadata: {
            appointmentId: newAppointment.id,
            ticketId: validated.ticketId,
            vendorId: validated.vendorId,
            scheduledStart: scheduledStart.toISOString(),
          },
        },
      });
      
      // Notify vendor
      await tx.notification.create({
        data: {
          userId: vendor.userId,
          type: "MAINTENANCE_SCHEDULED",
          title: "New Appointment Scheduled",
          message: `You have a new appointment on ${scheduledStart.toLocaleDateString()} at ${scheduledStart.toLocaleTimeString()}`,
          actionUrl: `/dashboard/vendor/schedule`,
          metadata: {
            appointmentId: newAppointment.id,
          },
        },
      });
      
      return newAppointment;
    });
    
    revalidatePath("/dashboard/vendor/schedule");
    revalidatePath("/dashboard/schedule");
    if (validated.ticketId) {
      revalidatePath(`/dashboard/maintenance/${validated.ticketId}`);
    }
    
    return {
      success: true,
      data: serializeAppointment(appointment),
      message: "Appointment scheduled successfully",
    };
  } catch (error) {
    console.error("Create appointment error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create appointment. Please try again.",
    };
  }
}

// -------------------------
// Get Appointments
// -------------------------
export async function getAppointments(params?: {
  search?: string;
  status?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ScheduleResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;
    
    const where: Prisma.ServiceAppointmentWhereInput = {};
    
    // Filter by user role
    if (currentUser.role === "VENDOR" && currentUser.vendorProfile) {
      where.vendorId = currentUser.vendorProfile.id;
    } else if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.ticket = {
        property: {
          landlordId: currentUser.landlordProfile.id,
        },
      };
    } else if (currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    // Filter by vendor
    if (params?.vendorId) {
      where.vendorId = params.vendorId;
    }
    
    // Filter by status
    if (params?.status && params.status !== "ALL") {
      where.status = params.status as any;
    }
    
    // Filter by date range
    if (params?.startDate || params?.endDate) {
      where.scheduledStart = {};
      if (params.startDate) {
        where.scheduledStart.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.scheduledStart.lte = new Date(params.endDate);
      }
    }
    
    // Search filter
    if (params?.search) {
      where.OR = [
        { ticket: { title: { contains: params.search, mode: "insensitive" } } },
        { vendor: { businessName: { contains: params.search, mode: "insensitive" } } },
      ];
    }
    
    const [appointments, total] = await Promise.all([
      prisma.serviceAppointment.findMany({
        where,
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          ticket: {
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
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          scheduledStart: "asc",
        },
      }),
      prisma.serviceAppointment.count({ where }),
    ]);
    
    const serializedAppointments = appointments.map(serializeAppointment);
    
    return {
      success: true,
      data: {
        appointments: serializedAppointments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get appointments error:", error);
    return {
      success: false,
      error: "Failed to fetch appointments",
    };
  }
}

// -------------------------
// Get Appointment by ID
// -------------------------
export async function getAppointmentById(appointmentId: string): Promise<ScheduleResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const appointment = await prisma.serviceAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        ticket: {
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
          },
        },
      },
    });
    
    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }
    
    // Check authorization
    const isVendor = currentUser.role === "VENDOR" && appointment.vendorId === currentUser.vendorProfile?.id;
    const isLandlord = currentUser.role === "LANDLORD" && 
      appointment.ticket?.property.landlordId === currentUser.landlordProfile?.id;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isVendor && !isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    return {
      success: true,
      data: serializeAppointment(appointment),
    };
  } catch (error) {
    console.error("Get appointment error:", error);
    return {
      success: false,
      error: "Failed to fetch appointment details",
    };
  }
}

// -------------------------
// Update Appointment
// -------------------------
export async function updateAppointment(
  appointmentId: string,
  data: z.infer<typeof updateAppointmentSchema>
): Promise<ScheduleResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const appointment = await prisma.serviceAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        vendor: {
          include: {
            user: true,
          },
        },
        ticket: {
          include: {
            property: {
              include: {
                landlord: true,
              },
            },
          },
        },
      },
    });
    
    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }
    
    // Check authorization
    const isVendor = currentUser.role === "VENDOR" && appointment.vendorId === currentUser.vendorProfile?.id;
    const isLandlord = currentUser.role === "LANDLORD" && 
      appointment.ticket?.property.landlordId === currentUser.landlordProfile?.id;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isVendor && !isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const validated = updateAppointmentSchema.parse(data);
    
    const updatedAppointment = await prisma.$transaction(async (tx) => {
      const updated = await tx.serviceAppointment.update({
        where: { id: appointmentId },
        data: {
          ...(validated.status && { status: validated.status as any }),
          ...(validated.scheduledStart && { scheduledStart: new Date(validated.scheduledStart) }),
          ...(validated.scheduledEnd && { scheduledEnd: new Date(validated.scheduledEnd) }),
          ...(validated.actualStart && { actualStart: new Date(validated.actualStart) }),
          ...(validated.actualEnd && { actualEnd: new Date(validated.actualEnd) }),
          ...(validated.notes !== undefined && { notes: validated.notes }),
        },
        include: {
          vendor: {
            include: {
              user: true,
            },
          },
          ticket: {
            include: {
              property: true,
            },
          },
        },
      });
      
      // Update ticket status based on appointment status
      if (validated.status && appointment.ticketId) {
        let ticketStatus = null;
        
        if (validated.status === "IN_PROGRESS") {
          ticketStatus = "IN_PROGRESS";
        } else if (validated.status === "COMPLETED") {
          ticketStatus = "COMPLETED";
        } else if (validated.status === "CANCELLED") {
          ticketStatus = "OPEN";
        }
        
        if (ticketStatus) {
          await tx.maintenanceTicket.update({
            where: { id: appointment.ticketId },
            data: { status: ticketStatus as any },
          });
        }
      }
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_UPDATED" as ActivityType,
          action: `Updated appointment status to ${validated.status || appointment.status}`,
          metadata: {
            appointmentId: appointmentId,
            previousStatus: appointment.status,
            newStatus: validated.status,
          },
        },
      });
      
      // Notify on status change
      if (validated.status && validated.status !== appointment.status) {
        const notifyUserId = isVendor 
          ? appointment.ticket?.property.landlord.userId 
          : appointment.vendor.userId;
        
        if (notifyUserId) {
          let message = `Appointment status changed to ${validated.status}`;
          if (validated.status === "CONFIRMED") {
            message = `Appointment confirmed for ${appointment.scheduledStart.toLocaleString()}`;
          } else if (validated.status === "COMPLETED") {
            message = `Appointment completed successfully`;
          } else if (validated.status === "CANCELLED") {
            message = `Appointment has been cancelled`;
          }
          
          await tx.notification.create({
            data: {
              userId: notifyUserId,
              type: "MAINTENANCE_REQUEST",
              title: "Appointment Status Updated",
              message: message,
              actionUrl: `/dashboard/schedule`,
              metadata: {
                appointmentId: appointmentId,
                status: validated.status,
              },
            },
          });
        }
      }
      
      return updated;
    });
    
    revalidatePath("/dashboard/vendor/schedule");
    revalidatePath("/dashboard/schedule");
    if (appointment.ticketId) {
      revalidatePath(`/dashboard/maintenance/${appointment.ticketId}`);
    }
    
    return {
      success: true,
      data: serializeAppointment(updatedAppointment),
      message: "Appointment updated successfully",
    };
  } catch (error) {
    console.error("Update appointment error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update appointment. Please try again.",
    };
  }
}

// -------------------------
// Delete Appointment
// -------------------------
export async function deleteAppointment(appointmentId: string): Promise<ScheduleResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const appointment = await prisma.serviceAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        ticket: {
          include: {
            property: true,
          },
        },
      },
    });
    
    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }
    
    // Check authorization
    const isLandlord = currentUser.role === "LANDLORD" && 
      appointment.ticket?.property.landlordId === currentUser.landlordProfile?.id;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Only landlords can delete appointments",
      };
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.serviceAppointment.delete({
        where: { id: appointmentId },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_DELETED" as ActivityType,
          action: `Deleted appointment`,
          metadata: {
            appointmentId: appointmentId,
          },
        },
      });
    });
    
    revalidatePath("/dashboard/vendor/schedule");
    revalidatePath("/dashboard/schedule");
    
    return {
      success: true,
      message: "Appointment deleted successfully",
    };
  } catch (error) {
    console.error("Delete appointment error:", error);
    return {
      success: false,
      error: "Failed to delete appointment. Please try again.",
    };
  }
}

// -------------------------
// Get Available Vendors
// -------------------------
export async function getAvailableVendors(params?: {
  category?: string;
  date?: string;
}): Promise<ScheduleResult> {
  try {
    const where: Prisma.VendorWhereInput = {
      isActive: true,
    };
    
    if (params?.category) {
      where.category = params.category as any;
    }
    
    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        appointments: params?.date ? {
          where: {
            scheduledStart: {
              gte: new Date(params.date),
              lt: new Date(new Date(params.date).getTime() + 24 * 60 * 60 * 1000),
            },
            status: {
              in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
            },
          },
        } : false,
      },
      orderBy: {
        rating: "desc",
      },
    });
    
    return {
      success: true,
      data: vendors,
    };
  } catch (error) {
    console.error("Get available vendors error:", error);
    return {
      success: false,
      error: "Failed to fetch vendors",
    };
  }
}