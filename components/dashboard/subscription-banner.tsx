// components/dashboard/subscription-banner.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, XCircle, CreditCard, X } from "lucide-react";
import Link from "next/link";

interface BannerData {
  show: boolean;
  level: "grace" | "locked" | "canceled" | "tenant_affected" | null;
  message: string;
  daysRemaining?: number;
}

async function fetchBanner(): Promise<BannerData> {
  const r = await fetch("/api/subscription/access", { cache: "no-store" });
  if (!r.ok) return { show: false, level: null, message: "" };
  const data = await r.json();
  return data.banner || { show: false, level: null, message: "" };
}

/**
 * Fetches subscription access state from a lightweight API route and
 * renders the appropriate banner. Place this near the top of the
 * dashboard layout so it shows on every page.
 *
 * Auto-refreshes when the window regains focus (e.g. after the user
 * updates their payment method in Stripe and returns to the tab).
 */
export function SubscriptionBanner() {
  const [banner, setBanner] = useState<BannerData>({ show: false, level: null, message: "" });
  const [dismissed, setDismissed] = useState(false);

  const refresh = useCallback(() => {
    fetchBanner().then((data) => {
      setBanner(data);
      // Re-set dismissed if the backend says we still need to show it
      if (data.show) setDismissed(false);
    }).catch(() => {/* silently ignore */});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Re-fetch when window regains focus (user returns from Stripe / settings)
  useEffect(() => {
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  if (!banner.show || dismissed) return null;

  const isLocked = banner.level === "locked" || banner.level === "canceled";
  const isTenantAffected = banner.level === "tenant_affected";

  const bg = isLocked || isTenantAffected
    ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
    : "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800";

  const textColor = isLocked || isTenantAffected
    ? "text-red-800 dark:text-red-200"
    : "text-amber-800 dark:text-amber-200";

  const Icon = isLocked || isTenantAffected ? XCircle : AlertTriangle;

  return (
    <div className={`w-full border-b px-4 py-3 ${bg}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Icon className={`h-4 w-4 shrink-0 ${textColor}`} />

        <p className={`flex-1 text-sm ${textColor}`}>
          {banner.message}
          {!isTenantAffected && (
            <>
              {" "}
              <Link
                href="/dashboard/settings/subscription"
                className="font-medium underline underline-offset-2"
              >
                <CreditCard className="inline h-3.5 w-3.5 mr-1" />
                Update payment method
              </Link>
            </>
          )}
        </p>

        {/* Allow dismissing grace-period banners but not locked ones */}
        {banner.level === "grace" && (
          <button
            onClick={() => setDismissed(true)}
            className={`shrink-0 rounded-md p-1 ${textColor} hover:bg-black/10`}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}