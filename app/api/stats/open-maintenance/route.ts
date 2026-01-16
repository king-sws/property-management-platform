// ============================================================================
// app/api/stats/open-maintenance/route.ts
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        landlordProfile: true,
        tenantProfile: true,
      },
    });

    let count = 0;

    if (user?.landlordProfile) {
      // Count open tickets for landlord's properties
      count = await prisma.maintenanceTicket.count({
        where: {
          property: {
            landlordId: user.landlordProfile.id,
          },
          status: {
            in: ["OPEN", "IN_PROGRESS", "WAITING_VENDOR", "WAITING_PARTS", "SCHEDULED"],
          },
        },
      });
    } else if (user?.tenantProfile) {
      // Count tickets created by tenant
      count = await prisma.maintenanceTicket.count({
        where: {
          createdById: user.id, // Tenant created these tickets
          status: {
            in: ["OPEN", "IN_PROGRESS", "WAITING_VENDOR", "WAITING_PARTS", "SCHEDULED"],
          },
        },
      });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching open maintenance:", error);
    return NextResponse.json({ count: 0 });
  }
}