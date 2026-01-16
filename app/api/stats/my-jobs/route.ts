// ============================================================================
// app/api/stats/my-jobs/route.ts (for vendors)
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
      include: { vendorProfile: true },
    });

    if (!user?.vendorProfile) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.maintenanceTicket.count({
      where: {
        vendorId: user.vendorProfile.id,
        status: {
          in: ["IN_PROGRESS", "SCHEDULED", "WAITING_PARTS"],
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching vendor jobs:", error);
    return NextResponse.json({ count: 0 });
  }
}