/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/invoices.ts
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
const createInvoiceSchema = z.object({
  ticketId: z.string().min(1, "Ticket is required"),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Price must be positive"),
    amount: z.number().min(0, "Amount must be positive"),
  })).min(1, "At least one item is required"),
  subtotal: z.number().min(0),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

const updateInvoiceSchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "PAID", "REJECTED", "CANCELLED"]).optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    amount: z.number(),
  })).optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  discount: z.number().optional(),
  total: z.number().optional(),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
  paidAt: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentDate: z.string().optional(),
});

// -------------------------
// Types
// -------------------------
type InvoiceResult = {
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

function serializeInvoice(invoice: any) {
  return {
    ...invoice,
    subtotal: invoice.subtotal ? Number(invoice.subtotal) : null,
    tax: invoice.tax ? Number(invoice.tax) : null,
    discount: invoice.discount ? Number(invoice.discount) : null,
    total: invoice.total ? Number(invoice.total) : null,
    dueDate: invoice.dueDate?.toISOString() || null,
    paidAt: invoice.paidAt?.toISOString() || null,
    createdAt: invoice.createdAt?.toISOString() || null,
    updatedAt: invoice.updatedAt?.toISOString() || null,
    ticket: invoice.ticket ? {
      ...invoice.ticket,
      estimatedCost: invoice.ticket.estimatedCost ? Number(invoice.ticket.estimatedCost) : null,
      actualCost: invoice.ticket.actualCost ? Number(invoice.ticket.actualCost) : null,
      createdAt: invoice.ticket.createdAt?.toISOString() || null,
    } : null,
    vendor: invoice.vendor ? {
      ...invoice.vendor,
      rating: invoice.vendor.rating ? Number(invoice.vendor.rating) : null,
      createdAt: invoice.vendor.createdAt?.toISOString() || null,
    } : null,
  };
}

// Generate unique invoice number
function generateInvoiceNumber(): string {
  const prefix = "INV";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// -------------------------
// Create Invoice
// -------------------------
export async function createInvoice(data: z.infer<typeof createInvoiceSchema>): Promise<InvoiceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "VENDOR") {
      return {
        success: false,
        error: "Only vendors can create invoices",
      };
    }
    
    if (!currentUser.vendorProfile) {
      return {
        success: false,
        error: "Vendor profile not found",
      };
    }
    
    const validated = createInvoiceSchema.parse(data);
    
    // Verify ticket exists and vendor is assigned
    const ticket = await prisma.maintenanceTicket.findUnique({
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
    
    if (ticket.vendorId !== currentUser.vendorProfile.id) {
      return {
        success: false,
        error: "You are not assigned to this ticket",
      };
    }
    
    // Create invoice
    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.vendorInvoice.create({
        data: {
          invoiceNumber: generateInvoiceNumber(),
          vendorId: currentUser.vendorProfile!.id,
          ticketId: validated.ticketId,
          landlordId: ticket.property.landlordId,
          status: "PENDING",
          items: validated.items,
          subtotal: validated.subtotal,
          tax: validated.tax || 0,
          discount: validated.discount || 0,
          total: validated.total,
          notes: validated.notes,
          dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
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
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_CREATED" as ActivityType,
          action: `Created invoice ${newInvoice.invoiceNumber}`,
          metadata: {
            invoiceId: newInvoice.id,
            ticketId: validated.ticketId,
            total: validated.total,
          },
        },
      });
      
      // Notify landlord
      await tx.notification.create({
        data: {
          userId: ticket.property.landlord.userId,
          type: "MAINTENANCE_REQUEST",
          title: "New Invoice Submitted",
          message: `${currentUser.vendorProfile?.businessName} submitted invoice ${newInvoice.invoiceNumber} for ${ticket.title}`,
          actionUrl: `/dashboard/invoices/${newInvoice.id}`,
          metadata: {
            invoiceId: newInvoice.id,
            amount: validated.total,
          },
        },
      });
      
      return newInvoice;
    });
    
    revalidatePath("/dashboard/vendor/invoices");
    revalidatePath("/dashboard/invoices");
    
    return {
      success: true,
      data: serializeInvoice(invoice),
      message: "Invoice created successfully",
    };
  } catch (error) {
    console.error("Create invoice error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create invoice. Please try again.",
    };
  }
}

// -------------------------
// Get Invoices
// -------------------------
export async function getInvoices(params?: {
  search?: string;
  status?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
}): Promise<InvoiceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    
    const where: Prisma.VendorInvoiceWhereInput = {};
    
    // Filter by user role
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.landlordId = currentUser.landlordProfile.id;
    } else if (currentUser.role === "VENDOR" && currentUser.vendorProfile) {
      where.vendorId = currentUser.vendorProfile.id;
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
    
    // Search filter
    if (params?.search) {
      where.OR = [
        { invoiceNumber: { contains: params.search, mode: "insensitive" } },
        { ticket: { title: { contains: params.search, mode: "insensitive" } } },
        { vendor: { businessName: { contains: params.search, mode: "insensitive" } } },
      ];
    }
    
    const [invoices, total] = await Promise.all([
      prisma.vendorInvoice.findMany({
        where,
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
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
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.vendorInvoice.count({ where }),
    ]);
    
    const serializedInvoices = invoices.map(serializeInvoice);
    
    return {
      success: true,
      data: {
        invoices: serializedInvoices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get invoices error:", error);
    return {
      success: false,
      error: "Failed to fetch invoices",
    };
  }
}

// -------------------------
// Get Invoice by ID
// -------------------------
export async function getInvoiceById(invoiceId: string): Promise<InvoiceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const invoice = await prisma.vendorInvoice.findUnique({
      where: { id: invoiceId },
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
    
    if (!invoice) {
      return {
        success: false,
        error: "Invoice not found",
      };
    }
    
    // Check authorization
    const isVendor = currentUser.role === "VENDOR" && invoice.vendorId === currentUser.vendorProfile?.id;
    const isLandlord = currentUser.role === "LANDLORD" && invoice.landlordId === currentUser.landlordProfile?.id;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isVendor && !isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    return {
      success: true,
      data: serializeInvoice(invoice),
    };
  } catch (error) {
    console.error("Get invoice error:", error);
    return {
      success: false,
      error: "Failed to fetch invoice details",
    };
  }
}

// -------------------------
// Update Invoice
// -------------------------
export async function updateInvoice(
  invoiceId: string,
  data: z.infer<typeof updateInvoiceSchema>
): Promise<InvoiceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const invoice = await prisma.vendorInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: true,
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
    
    if (!invoice) {
      return {
        success: false,
        error: "Invoice not found",
      };
    }
    
    // FIXED: Add null check for ticket before accessing nested properties
    if (!invoice.ticket) {
      return {
        success: false,
        error: "Invoice ticket not found",
      };
    }
    
    // Check authorization
    const isVendor = currentUser.role === "VENDOR" && invoice.vendorId === currentUser.vendorProfile?.id;
    const isLandlord = currentUser.role === "LANDLORD" && invoice.landlordId === currentUser.landlordProfile?.id;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isVendor && !isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    // Vendors can only edit DRAFT invoices
    if (isVendor && invoice.status !== "DRAFT") {
      return {
        success: false,
        error: "Can only edit draft invoices",
      };
    }
    
    const validated = updateInvoiceSchema.parse(data);
    
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const updated = await tx.vendorInvoice.update({
        where: { id: invoiceId },
        data: {
          ...(validated.status && { status: validated.status as any }),
          ...(validated.items && { items: validated.items }),
          ...(validated.subtotal !== undefined && { subtotal: validated.subtotal }),
          ...(validated.tax !== undefined && { tax: validated.tax }),
          ...(validated.discount !== undefined && { discount: validated.discount }),
          ...(validated.total !== undefined && { total: validated.total }),
          ...(validated.notes !== undefined && { notes: validated.notes }),
          ...(validated.rejectionReason && { rejectionReason: validated.rejectionReason }),
          ...(validated.paidAt && { paidAt: new Date(validated.paidAt) }),
          ...(validated.status === "APPROVED" && { approvedAt: new Date() }),
          ...(validated.paymentMethod && { paymentMethod: validated.paymentMethod }),
          ...(validated.paymentReference && { paymentReference: validated.paymentReference }),
          ...(validated.paymentDate && { paymentDate: new Date(validated.paymentDate) }),
        },
        include: {
          vendor: {
            include: {
              user: true,
            },
          },
          ticket: true,
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_UPDATED" as ActivityType,
          action: `Updated invoice ${invoice.invoiceNumber}`,
          metadata: {
            invoiceId: invoiceId,
            previousStatus: invoice.status,
            newStatus: validated.status,
          },
        },
      });
      
      // Notify on status change
      if (validated.status && validated.status !== invoice.status) {
        // FIXED: Safe to access invoice.ticket.property now due to earlier null check
        if (!invoice.ticket) {
          return {
            success: false,
            error: "Invoice ticket not found",
          };
        }
        const notifyUserId = isLandlord ? invoice.vendor.userId : invoice.ticket.property.landlord.userId;
        
        let title = "Invoice Status Updated";
        let message = `Invoice ${invoice.invoiceNumber} status changed to ${validated.status}`;
        
        if (validated.status === "APPROVED") {
          title = "Invoice Approved";
          message = `Your invoice ${invoice.invoiceNumber} has been approved`;
        } else if (validated.status === "REJECTED") {
          title = "Invoice Rejected";
          message = `Invoice ${invoice.invoiceNumber} was rejected. Reason: ${validated.rejectionReason || "Not specified"}`;
        } else if (validated.status === "PAID") {
          title = "Invoice Paid";
          message = `Invoice ${invoice.invoiceNumber} has been marked as paid`;
        }
        
        await tx.notification.create({
          data: {
            userId: notifyUserId,
            type: "MAINTENANCE_REQUEST",
            title: title,
            message: message,
            actionUrl: `/dashboard/invoices/${invoiceId}`,
            metadata: {
              invoiceId: invoiceId,
              status: validated.status,
            },
          },
        });
      }
      
      return updated;
    });
    
    revalidatePath("/dashboard/vendor/invoices");
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    
    return {
      success: true,
      data: serializeInvoice(updatedInvoice),
      message: "Invoice updated successfully",
    };
  } catch (error) {
    console.error("Update invoice error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update invoice. Please try again.",
    };
  }
}

// -------------------------
// Get Invoice Statistics
// -------------------------
export async function getInvoiceStatistics(): Promise<InvoiceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const where: Prisma.VendorInvoiceWhereInput = {};
    
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.landlordId = currentUser.landlordProfile.id;
    } else if (currentUser.role === "VENDOR" && currentUser.vendorProfile) {
      where.vendorId = currentUser.vendorProfile.id;
    }
    
    const [total, pending, approved, paid, rejected] = await Promise.all([
      prisma.vendorInvoice.count({ where }),
      prisma.vendorInvoice.count({ where: { ...where, status: "PENDING" } }),
      prisma.vendorInvoice.count({ where: { ...where, status: "APPROVED" } }),
      prisma.vendorInvoice.count({ where: { ...where, status: "PAID" } }),
      prisma.vendorInvoice.count({ where: { ...where, status: "REJECTED" } }),
    ]);
    
    const totalAmount = await prisma.vendorInvoice.aggregate({
      where,
      _sum: {
        total: true,
      },
    });
    
    const paidAmount = await prisma.vendorInvoice.aggregate({
      where: { ...where, status: "PAID" },
      _sum: {
        total: true,
      },
    });
    
    const pendingAmount = await prisma.vendorInvoice.aggregate({
      where: { ...where, status: { in: ["PENDING", "APPROVED"] } },
      _sum: {
        total: true,
      },
    });
    
    return {
      success: true,
      data: {
        total,
        pending,
        approved,
        paid,
        rejected,
        totalAmount: Number(totalAmount._sum.total || 0),
        paidAmount: Number(paidAmount._sum.total || 0),
        pendingAmount: Number(pendingAmount._sum.total || 0),
      },
    };
  } catch (error) {
    console.error("Get invoice statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}

export async function getVendorCompletedTickets(): Promise<InvoiceResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "VENDOR") {
      return {
        success: false,
        error: "Only vendors can access this",
      };
    }
    
    if (!currentUser.vendorProfile) {
      return {
        success: false,
        error: "Vendor profile not found",
      };
    }
    
    // Get completed tickets that don't have invoices yet
    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        vendorId: currentUser.vendorProfile.id,
        status: "COMPLETED",
        // Only tickets without invoices
        vendorInvoices: {
          none: {},
        },
      },
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
      orderBy: {
        completedDate: "desc",
      },
    });
    
    const serializedTickets = tickets.map(ticket => ({
      ...ticket,
      estimatedCost: ticket.estimatedCost ? Number(ticket.estimatedCost) : null,
      actualCost: ticket.actualCost ? Number(ticket.actualCost) : null,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      scheduledDate: ticket.scheduledDate?.toISOString() || null,
      completedDate: ticket.completedDate?.toISOString() || null,
      deletedAt: ticket.deletedAt?.toISOString() || null,
    }));
    
    return {
      success: true,
      data: serializedTickets,
    };
  } catch (error) {
    console.error("Get vendor tickets error:", error);
    return {
      success: false,
      error: "Failed to fetch tickets",
    };
  }
}