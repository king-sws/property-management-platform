// lib/actions/dunning.ts
"use server";

import prisma from "@/lib/prisma";
import { SubscriptionStatus } from "@/lib/generated/prisma/enums";
import { GRACE_PERIOD_DAYS } from "@/lib/subscription-guard";

/**
 * Called by the daily cron job (/api/cron/dunning).
 * Finds every PAST_DUE landlord and sends the right dunning notification
 * based on how many days since their subscription lapsed.
 *
 * Sequence:
 *   Day 1  → "Payment failed – please update your card"
 *   Day 3  → "4 days left before account restriction"
 *   Day 7  → "Account restricted – update now to regain access"
 *   Day 7+ → account already locked (no further dunning, just the locked state)
 *
 * Uses lastDunningDay to avoid sending duplicate notifications.
 * Includes backfill logic — if the cron misses a day, it catches up.
 */
export async function runDunningSequence(): Promise<{
  processed: number;
  errors: number;
}> {
  let processed = 0;
  let errors = 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://propely.site";

  // Dunning days to send notifications on
  const DUNNING_DAYS = [1, 3, 7];

  const pastDueLandlords = await prisma.landlord.findMany({
    where: {
      subscriptionStatus: SubscriptionStatus.PAST_DUE,
      deletedAt: null,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  for (const landlord of pastDueLandlords) {
    try {
      const graceStart =
        landlord.currentPeriodEnd ?? landlord.trialEndsAt ?? landlord.updatedAt;

      const now = new Date();
      const msSinceLapse = now.getTime() - graceStart.getTime();
      const daysSinceLapse = Math.floor(msSinceLapse / (1000 * 60 * 60 * 24));

      const graceExpiresAt = new Date(graceStart);
      graceExpiresAt.setDate(graceExpiresAt.getDate() + GRACE_PERIOD_DAYS);
      const daysRemaining = Math.max(
        0,
        Math.ceil((graceExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      // If grace period already expired, skip
      if (daysSinceLapse > GRACE_PERIOD_DAYS) continue;

      // Find all pending dunning days that haven't been sent yet
      const pendingDunningDays = DUNNING_DAYS.filter(
        (day) => day <= daysSinceLapse && day > landlord.lastDunningDay
      );

      if (pendingDunningDays.length === 0) continue;

      // Send all pending notifications (backfill for missed days)
      for (const dunningDay of pendingDunningDays) {
        const remainingAtDunningDay = Math.max(
          0,
          Math.ceil((graceExpiresAt.getTime() - new Date(graceStart.getTime() + dunningDay * 24 * 60 * 60 * 1000).getTime()) / (1000 * 60 * 60 * 24))
        );

        const { title, message } = getDunningContent(dunningDay, remainingAtDunningDay, landlord.subscriptionTier, appUrl);

        // In-app notification
        await prisma.notification.create({
          data: {
            userId: landlord.userId,
            type: "PAYMENT_FAILED",
            channel: "IN_APP",
            title,
            message,
            actionUrl: "/dashboard/settings/subscription",
            metadata: {
              dunningDay,
              graceExpiresAt: graceExpiresAt.toISOString(),
              daysRemaining: remainingAtDunningDay,
            },
          },
        });

        // Email notification
        await prisma.notification.create({
          data: {
            userId: landlord.userId,
            type: "PAYMENT_FAILED",
            channel: "EMAIL",
            title,
            message,
            actionUrl: "/dashboard/settings/subscription",
            metadata: {
              dunningDay,
              graceExpiresAt: graceExpiresAt.toISOString(),
              daysRemaining: remainingAtDunningDay,
              recipientEmail: landlord.user.email,
              recipientName: landlord.user.name ?? "Landlord",
            },
          },
        });
      }

      // Update lastDunningDay to the highest pending day
      const maxDunningDay = Math.max(...pendingDunningDays);
      await prisma.landlord.update({
        where: { id: landlord.id },
        data: { lastDunningDay: maxDunningDay },
      });

      // On day 7 or when grace expires — log account restriction
      if (daysSinceLapse >= GRACE_PERIOD_DAYS && landlord.lastDunningDay < 7) {
        await prisma.activityLog.create({
          data: {
            userId: landlord.userId,
            type: "USER_LOGIN",
            action: "Account restricted due to unpaid subscription",
            metadata: {
              gracePeriodExpired: true,
              graceExpiresAt: graceExpiresAt.toISOString(),
            },
          },
        });
      }

      processed++;
    } catch (err) {
      console.error(`Dunning error for landlord ${landlord.id}:`, err);
      errors++;
    }
  }

  return { processed, errors };
}

function getDunningContent(
  daysSinceLapse: number,
  daysRemaining: number,
  tier: string,
  appUrl: string
): { title: string; message: string } {
  const planName = tier.charAt(0) + tier.slice(1).toLowerCase(); // "Professional"
  const actionText = `Update payment method → ${appUrl}/dashboard/settings/subscription`;

  if (daysSinceLapse === 1) {
    return {
      title: "Action required: Payment failed",
      message: `Your ${planName} plan payment failed. You have ${daysRemaining} days to update your payment method before your account is restricted. Your properties and tenant data are safe. ${actionText}`,
    };
  }

  if (daysSinceLapse === 3) {
    return {
      title: `${daysRemaining} days left before account restriction`,
      message: `Your Propely subscription is still unpaid. In ${daysRemaining} days you will lose the ability to add properties, create leases, and manage tenants. Update your payment method now to avoid interruption. ${actionText}`,
    };
  }

  // Day 7
  return {
    title: "Your account has been restricted",
    message: `Your Propely account is now restricted because the ${planName} plan subscription remains unpaid. You can still view your existing properties and data, but you cannot make changes until payment is resolved. ${actionText}`,
  };
}