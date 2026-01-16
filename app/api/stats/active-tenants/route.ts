// ============================================================================
// app/api/stats/active-tenants/route.ts
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
      include: { landlordProfile: true },
    });

    if (!user?.landlordProfile) {
      return NextResponse.json({ count: 0 });
    }

    // Count unique tenants with active leases
    const activeTenants = await prisma.leaseTenant.findMany({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: user.landlordProfile.id,
            },
          },
          status: {
            in: ["ACTIVE", "EXPIRING_SOON"],
          },
        },
      },
      select: {
        tenantId: true,
      },
      distinct: ["tenantId"],
    });

    return NextResponse.json({ count: activeTenants.length });
  } catch (error) {
    console.error("Error fetching active tenants:", error);
    return NextResponse.json({ count: 0 });
  }
}