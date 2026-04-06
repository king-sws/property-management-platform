// app/api/subscription/access/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getLandlordAccessByUserId,
  getAccessMessage,
  GRACE_PERIOD_DAYS,
} from "@/lib/subscription-guard";
import { SubscriptionStatus } from "@/lib/generated/prisma/enums";

/**
 * Returns banner data for the current user.
 * - Landlords: their own subscription state
 * - Tenants: whether their landlord's account is locked (affecting their access)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ banner: null });
    }

    const userId = session.user.id;
    const role = session.user.role;

    // ── Landlord ──────────────────────────────────────────────────────────────
    if (role === "LANDLORD") {
      const access = await getLandlordAccessByUserId(userId);

      if (access.level === "full") {
        return NextResponse.json({ banner: { show: false, level: null, message: "" } });
      }

      return NextResponse.json({
        banner: {
          show: true,
          level: access.level,
          message: getAccessMessage(access),
          daysRemaining: access.graceDaysRemaining,
          graceExpiresAt: access.graceExpiresAt,
        },
      });
    }

    // ── Tenant ────────────────────────────────────────────────────────────────
    if (role === "TENANT") {
      // Find the landlord(s) this tenant is associated with via active leases
      const tenant = await prisma.tenant.findUnique({
        where: { userId },
        include: {
          leaseMembers: {
            where: {
              lease: {
                status: "ACTIVE",
              },
            },
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: {
                        include: {
                          landlord: {
                            select: {
                              id: true,
                              subscriptionStatus: true,
                              currentPeriodEnd: true,
                              trialEndsAt: true,
                              updatedAt: true,
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

      if (!tenant) {
        return NextResponse.json({ banner: { show: false, level: null, message: "" } });
      }

      // Check if any of the tenant's landlords are locked
      const landlords = tenant.leaseMembers.map(
        (lm) => lm.lease.unit.property.landlord
      );

      const lockedLandlord = landlords.find((l) => {
        if (l.subscriptionStatus !== SubscriptionStatus.PAST_DUE) return false;

        // Check if grace period has expired
        const graceStart =
          l.currentPeriodEnd ?? l.trialEndsAt ?? l.updatedAt;
        const graceExpiresAt = new Date(graceStart);
        graceExpiresAt.setDate(graceExpiresAt.getDate() + GRACE_PERIOD_DAYS);

        return new Date() > graceExpiresAt;
      });

      if (lockedLandlord) {
        return NextResponse.json({
          banner: {
            show: true,
            level: "tenant_affected",
            message:
              "Your landlord's account is temporarily restricted. Online rent payments are unavailable until they resolve their billing. Please contact your landlord directly.",
          },
        });
      }
    }

    return NextResponse.json({ banner: { show: false, level: null, message: "" } });
  } catch (error) {
    console.error("Subscription access API error:", error);
    return NextResponse.json({ banner: { show: false, level: null, message: "" } });
  }
}