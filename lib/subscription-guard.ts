// lib/subscription-guard.ts
import prisma from "@/lib/prisma";
import { SubscriptionStatus } from "@/lib/generated/prisma/enums";

export const GRACE_PERIOD_DAYS = 7;

export type AccessLevel =
  | "full"        // ACTIVE or TRIAL
  | "grace"       // PAST_DUE, within 7-day grace window
  | "locked"      // PAST_DUE, grace expired — read-only
  | "canceled";   // CANCELED

export interface SubscriptionAccess {
  level: AccessLevel;
  /** Days remaining in grace period (only set when level === "grace") */
  graceDaysRemaining?: number;
  /** ISO string of when grace period expires */
  graceExpiresAt?: string;
  canWrite: boolean;
  canRead: boolean;
}

/**
 * Returns the access level for a landlord.
 * Call this in any server action that mutates data.
 */
export async function getLandlordAccess(
  landlordId: string
): Promise<SubscriptionAccess> {
  const landlord = await prisma.landlord.findUnique({
    where: { id: landlordId },
    select: {
      subscriptionStatus: true,
      currentPeriodEnd: true,
      trialEndsAt: true,
      updatedAt: true,
    },
  });

  if (!landlord) {
    return { level: "locked", canWrite: false, canRead: false };
  }

  const status = landlord.subscriptionStatus;

  if (
    status === SubscriptionStatus.ACTIVE ||
    status === SubscriptionStatus.TRIAL
  ) {
    return { level: "full", canWrite: true, canRead: true };
  }

  if (status === SubscriptionStatus.PAST_DUE) {
    // Grace period starts from when the period ended (or trial ended)
    // Fallback to updatedAt — never use `new Date()` which would reset the grace window
    const graceStart =
      landlord.currentPeriodEnd ??
      landlord.trialEndsAt ??
      landlord.updatedAt;

    const graceExpiresAt = new Date(graceStart);
    graceExpiresAt.setDate(graceExpiresAt.getDate() + GRACE_PERIOD_DAYS);

    const now = new Date();
    if (now < graceExpiresAt) {
      const msRemaining = graceExpiresAt.getTime() - now.getTime();
      const graceDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
      return {
        level: "grace",
        graceDaysRemaining,
        graceExpiresAt: graceExpiresAt.toISOString(),
        canWrite: true, // still can write during grace
        canRead: true,
      };
    }

    // Grace period expired
    return { level: "locked", canWrite: false, canRead: true };
  }

  if (status === SubscriptionStatus.CANCELED) {
    return { level: "canceled", canWrite: false, canRead: true };
  }

  // INACTIVE, PAUSED, etc.
  return { level: "locked", canWrite: false, canRead: true };
}

/**
 * Convenience: resolves landlord ID from userId, then checks access.
 */
export async function getLandlordAccessByUserId(
  userId: string
): Promise<SubscriptionAccess> {
  const landlord = await prisma.landlord.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!landlord) {
    return { level: "locked", canWrite: false, canRead: false };
  }

  return getLandlordAccess(landlord.id);
}

/**
 * Returns a user-facing message for a given access level.
 */
export function getAccessMessage(access: SubscriptionAccess): string | null {
  switch (access.level) {
    case "grace":
      return `Your subscription payment failed. You have ${access.graceDaysRemaining} day${
        access.graceDaysRemaining !== 1 ? "s" : ""
      } to update your payment method before your account is restricted.`;
    case "locked":
      return "Your account is restricted due to an unpaid subscription. Please update your payment method to continue managing properties.";
    case "canceled":
      return "Your subscription has been canceled. Reactivate to manage properties.";
    default:
      return null;
  }
}