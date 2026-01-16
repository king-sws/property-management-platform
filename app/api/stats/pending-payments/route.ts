// ============================================================================
// app/api/stats/pending-payments/route.ts
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

    // Count overdue or pending payments
    const count = await prisma.payment.count({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: user.landlordProfile.id,
            },
          },
        },
        status: {
          in: ["PENDING", "PROCESSING"],
        },
        dueDate: {
          lte: new Date(), // Overdue or due today
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return NextResponse.json({ count: 0 });
  }
}