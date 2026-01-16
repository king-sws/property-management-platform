// ============================================================================
// app/api/stats/pending-applications/route.ts
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

    const count = await prisma.rentalApplication.count({
      where: {
        landlordId: user.landlordProfile.id,
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"],
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    return NextResponse.json({ count: 0 });
  }
}