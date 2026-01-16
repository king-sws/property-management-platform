// ============================================================================
// app/api/stats/tenant-applications/route.ts (for tenants)
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
      include: { tenantProfile: true },
    });

    if (!user?.tenantProfile) {
      return NextResponse.json({ count: 0 });
    }

    // Count pending applications
    const count = await prisma.rentalApplication.count({
      where: {
        tenantId: user.tenantProfile.id,
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"],
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching tenant applications:", error);
    return NextResponse.json({ count: 0 });
  }
}