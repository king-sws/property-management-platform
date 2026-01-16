/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/quick-messages.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createConversation } from "./messages";

// -------------------------
// Quick Message Actions
// -------------------------

/**
 * Message landlord about a specific property/unit
 * Used by tenants from their lease/unit pages
 */
export async function messageMyLandlord(
  propertyId: string,
  initialMessage?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
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
                            landlord: {
                              include: {
                                user: true,
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
          },
        },
      },
    });

    if (!user?.tenantProfile) {
      return {
        success: false,
        error: "Tenant profile not found",
      };
    }

    // Find landlord for this property
    const lease = user.tenantProfile.leaseMembers.find(
      (lm) => lm.lease.unit.property.id === propertyId
    );

    if (!lease) {
      return {
        success: false,
        error: "No active lease found for this property",
      };
    }

    const landlordUserId = lease.lease.unit.property.landlord.userId;

    return await createConversation(
      [landlordUserId],
      `Property: ${lease.lease.unit.property.name}`,
      initialMessage || "Hi, I have a question about the property."
    );
  } catch (error) {
    console.error("Message landlord error:", error);
    return {
      success: false,
      error: "Failed to message landlord",
    };
  }
}

/**
 * Message a tenant about their unit/lease
 * Used by landlords from property/lease management pages
 */
export async function messageTenant(
  tenantId: string,
  context?: {
    propertyName?: string;
    unitNumber?: string;
  },
  initialMessage?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        landlordProfile: true,
      },
    });

    if (!user?.landlordProfile) {
      return {
        success: false,
        error: "Landlord profile not found",
      };
    }

    // Verify tenant is actually in one of landlord's properties
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        user: true,
        leaseMembers: {
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return {
        success: false,
        error: "Tenant not found",
      };
    }

    const hasRelationship = tenant.leaseMembers.some(
      (lm) => lm.lease.unit.property.landlordId === user.landlordProfile!.id
    );

    if (!hasRelationship) {
      return {
        success: false,
        error: "No relationship with this tenant",
      };
    }

    const subject = context?.propertyName
      ? `${context.propertyName}${context.unitNumber ? ` - Unit ${context.unitNumber}` : ""}`
      : undefined;

    return await createConversation(
      [tenant.userId],
      subject,
      initialMessage || "Hi, I wanted to reach out regarding your lease."
    );
  } catch (error) {
    console.error("Message tenant error:", error);
    return {
      success: false,
      error: "Failed to message tenant",
    };
  }
}

/**
 * Message a vendor about a maintenance ticket
 * Used by landlords from maintenance pages
 */
export async function messageVendor(
  vendorId: string,
  ticketId?: string,
  initialMessage?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        landlordProfile: true,
      },
    });

    if (!user?.landlordProfile) {
      return {
        success: false,
        error: "Landlord profile not found",
      };
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: true,
        tickets: {
          where: {
            property: {
              landlordId: user.landlordProfile.id,
            },
          },
          take: 1,
        },
      },
    });

    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found",
      };
    }

    let subject = `Service Request`;
    if (ticketId) {
      const ticket = await prisma.maintenanceTicket.findUnique({
        where: { id: ticketId },
        include: {
          property: true,
        },
      });

      if (ticket) {
        subject = `Maintenance: ${ticket.title}`;
      }
    }

    return await createConversation(
      [vendor.userId],
      subject,
      initialMessage || "Hi, I'd like to discuss a maintenance request."
    );
  } catch (error) {
    console.error("Message vendor error:", error);
    return {
      success: false,
      error: "Failed to message vendor",
    };
  }
}

/**
 * Message landlord about a maintenance ticket
 * Used by vendors from their ticket list
 */
export async function messageLandlordAboutTicket(
  ticketId: string,
  initialMessage?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        vendorProfile: true,
      },
    });

    if (!user?.vendorProfile) {
      return {
        success: false,
        error: "Vendor profile not found",
      };
    }

    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        property: {
          include: {
            landlord: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!ticket || ticket.vendorId !== user.vendorProfile.id) {
      return {
        success: false,
        error: "Ticket not found or not assigned to you",
      };
    }

    return await createConversation(
      [ticket.property.landlord.userId],
      `Maintenance: ${ticket.title}`,
      initialMessage || "Hi, I have an update on the maintenance ticket."
    );
  } catch (error) {
    console.error("Message landlord error:", error);
    return {
      success: false,
      error: "Failed to message landlord",
    };
  }
}

/**
 * Start conversation from application
 * Used by both tenants and landlords
 */
export async function messageAboutApplication(
  applicationId: string,
  initialMessage?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const application = await prisma.rentalApplication.findUnique({
      where: { id: applicationId },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: {
          include: {
            user: true,
          },
        },
        landlord: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }

    // Determine who to message based on current user
    let recipientId: string;
    if (application.tenant.userId === session.user.id) {
      // Tenant messaging landlord
      recipientId = application.landlord.userId;
    } else if (application.landlord.userId === session.user.id) {
      // Landlord messaging tenant
      recipientId = application.tenant.userId;
    } else {
      return {
        success: false,
        error: "You are not part of this application",
      };
    }

    return await createConversation(
      [recipientId],
      `Application: ${application.unit.property.name} - Unit ${application.unit.unitNumber}`,
      initialMessage || "Hi, I'd like to discuss the rental application."
    );
  } catch (error) {
    console.error("Message about application error:", error);
    return {
      success: false,
      error: "Failed to start conversation",
    };
  }
}

/**
 * Get all users the current user can message
 * This is context-aware based on their relationships
 */
export async function getMyContacts() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        landlordProfile: {
          include: {
            properties: {
              include: {
                units: {
                  include: {
                    leases: {
                      where: {
                        status: {
                          in: ["ACTIVE", "EXPIRING_SOON"],
                        },
                      },
                      include: {
                        tenants: {
                          include: {
                            tenant: {
                              include: {
                                user: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                maintenanceTickets: {
                  include: {
                    vendor: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
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
                            landlord: {
                              include: {
                                user: true,
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
          },
        },
        vendorProfile: {
          include: {
            tickets: {
              include: {
                property: {
                  include: {
                    landlord: {
                      include: {
                        user: true,
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

    if (!user) {
      throw new Error("User not found");
    }

    const contacts: Set<string> = new Set();
    const contactDetails: any[] = [];

    if (user.landlordProfile) {
      // Get all tenants
      user.landlordProfile.properties.forEach((property) => {
        property.units.forEach((unit) => {
          unit.leases.forEach((lease) => {
            lease.tenants.forEach((lt) => {
              if (!contacts.has(lt.tenant.userId)) {
                contacts.add(lt.tenant.userId);
                contactDetails.push({
                  id: lt.tenant.userId,
                  name: lt.tenant.user.name,
                  email: lt.tenant.user.email,
                  image: lt.tenant.user.image,
                  avatar: lt.tenant.user.avatar,
                  role: lt.tenant.user.role,
                  context: `Tenant - ${property.name}`,
                });
              }
            });
          });
        });

        // Get all vendors
        property.maintenanceTickets.forEach((ticket) => {
          if (ticket.vendor && !contacts.has(ticket.vendor.userId)) {
            contacts.add(ticket.vendor.userId);
            contactDetails.push({
              id: ticket.vendor.userId,
              name: ticket.vendor.user.name,
              email: ticket.vendor.user.email,
              image: ticket.vendor.user.image,
              avatar: ticket.vendor.user.avatar,
              role: ticket.vendor.user.role,
              context: `Vendor - ${ticket.vendor.businessName}`,
            });
          }
        });
      });
    }

    if (user.tenantProfile) {
      // Get all landlords
      user.tenantProfile.leaseMembers.forEach((lm) => {
        const landlordUserId = lm.lease.unit.property.landlord.userId;
        if (!contacts.has(landlordUserId)) {
          contacts.add(landlordUserId);
          contactDetails.push({
            id: landlordUserId,
            name: lm.lease.unit.property.landlord.user.name,
            email: lm.lease.unit.property.landlord.user.email,
            image: lm.lease.unit.property.landlord.user.image,
            avatar: lm.lease.unit.property.landlord.user.avatar,
            role: lm.lease.unit.property.landlord.user.role,
            context: `Landlord - ${lm.lease.unit.property.name}`,
          });
        }
      });
    }

    if (user.vendorProfile) {
      // Get all landlords they've worked with
      user.vendorProfile.tickets.forEach((ticket) => {
        const landlordUserId = ticket.property.landlord.userId;
        if (!contacts.has(landlordUserId)) {
          contacts.add(landlordUserId);
          contactDetails.push({
            id: landlordUserId,
            name: ticket.property.landlord.user.name,
            email: ticket.property.landlord.user.email,
            image: ticket.property.landlord.user.image,
            avatar: ticket.property.landlord.user.avatar,
            role: ticket.property.landlord.user.role,
            context: `Landlord - ${ticket.property.name}`,
          });
        }
      });
    }

    return {
      success: true,
      data: {
        contacts: contactDetails,
      },
    };
  } catch (error) {
    console.error("Get contacts error:", error);
    return {
      success: false,
      error: "Failed to fetch contacts",
    };
  }
}