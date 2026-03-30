/* eslint-disable react-hooks/static-components */
// components/dashboard/sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@/lib/generated/prisma/enums";
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Wrench,
  Receipt,
  BarChart3,
  FileStack,
  Settings,
  Home,
  ClipboardList,
  Wallet,
  MessageSquare,
  Calendar,
  Star,
  Shield,
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo, memo, useEffect, useCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Image from "next/image";
import { useTheme } from "next-themes";

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  statKey?: string;
  color?: string;
}

interface SidebarStats {
  applications?: number;
  maintenance?: number;
  messages?: number;
  payments?: number;
  tenants?: number;
  myJobs?: number;
  pendingInvoices?: number;
}

// ============================================================================
// BADGE COLOR BY ROLE
// - Landlord: red   → action-required alerts
// - Tenant:   blue  → informational counts
// - Vendor:   amber → operational counts
// - Admin:    slate → neutral system counts
// ============================================================================

const getBadgeClasses = (role: UserRole): string => {
  switch (role) {
    case UserRole.LANDLORD: return "bg-[#a44649] text-white";
    case UserRole.TENANT:   return "bg-blue-500 text-white";
    case UserRole.VENDOR:   return "bg-amber-500 text-white";
    case UserRole.ADMIN:    return "bg-slate-500 text-white";
    default:                return "bg-primary/80 text-primary-foreground";
  }
};

// ============================================================================
// HELPERS
// ============================================================================

const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.LANDLORD: return "/dashboard/landlord";
    case UserRole.TENANT:   return "/dashboard/tenant";
    case UserRole.VENDOR:   return "/dashboard/vendor";
    case UserRole.ADMIN:    return "/dashboard/admin";
    default:                return "/dashboard";
  }
};

// ============================================================================
// NAVIGATION
// Each item has its own distinct color, but items stay within cohesive
// category families so the sidebar reads as intentional, not random.
//
// Communication / Nav  → blue family   (blue-500, cyan-500)
// Property & People    → purple family (indigo-500, violet-500, purple-500, fuchsia-500, indigo-400)
// Operations           → warm family   (orange-500, amber-500)
// Finance              → green family  (emerald-500, green-500, teal-500, lime-600)
// Documents            → sky family    (sky-500, sky-600)
// Vendor               → amber family  (amber-500, orange-500, yellow-500, amber-400)
// Admin                → neutral       (slate-500, zinc-500, stone-500)
// ============================================================================

const getNavigation = (role: UserRole): NavItem[] => {
  const dashboardPath = getDashboardPath(role);

  return [
    // ── Communication / Nav ─────────────────────────────────────────────────
    {
      title: "Overview",
      href: dashboardPath,
      icon: LayoutDashboard,
      roles: [UserRole.LANDLORD, UserRole.TENANT, UserRole.VENDOR, UserRole.ADMIN],
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      roles: [UserRole.LANDLORD, UserRole.TENANT, UserRole.VENDOR, UserRole.ADMIN],
      statKey: "messages",
      color: "text-cyan-500 dark:text-cyan-400",
    },

    // ── Property & People ───────────────────────────────────────────────────
    {
      title: "Browse Apartments",
      href: "/dashboard/browse-properties",
      icon: Building2,
      roles: [UserRole.TENANT],
      color: "text-violet-500 dark:text-violet-400",
    },
    {
      title: "Properties",
      href: "/dashboard/properties",
      icon: Building2,
      roles: [UserRole.LANDLORD],
      color: "text-indigo-500 dark:text-indigo-400",
    },
    {
      title: "Tenants",
      href: "/dashboard/tenants",
      icon: Users,
      roles: [UserRole.LANDLORD],
      statKey: "tenants",
      color: "text-violet-500 dark:text-violet-400",
    },
    {
      title: "Leases",
      href: "/dashboard/leases",
      icon: FileText,
      roles: [UserRole.LANDLORD],
      color: "text-purple-500 dark:text-purple-400",
    },
    {
      title: "Applications",
      href: "/dashboard/applications",
      icon: ClipboardList,
      roles: [UserRole.LANDLORD, UserRole.TENANT],
      statKey: "applications",
      color: "text-fuchsia-500 dark:text-fuchsia-400",
    },
    {
      title: "Vendors",
      href: "/dashboard/vendors",
      icon: Briefcase,
      roles: [UserRole.LANDLORD],
      color: "text-indigo-400 dark:text-indigo-300",
    },

    // ── Operations ──────────────────────────────────────────────────────────
    {
      title: "Maintenance",
      href: "/dashboard/maintenance",
      icon: Wrench,
      roles: [UserRole.LANDLORD, UserRole.TENANT],
      statKey: "maintenance",
      color: "text-orange-500 dark:text-orange-400",
    },
    {
      title: "Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
      roles: [UserRole.LANDLORD],
      color: "text-amber-500 dark:text-amber-400",
    },

    // ── Finance ─────────────────────────────────────────────────────────────
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: DollarSign,
      roles: [UserRole.LANDLORD],
      statKey: "payments",
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      title: "Invoices",
      href: "/dashboard/invoices",
      icon: Receipt,
      roles: [UserRole.LANDLORD],
      color: "text-green-500 dark:text-green-400",
    },
    {
      title: "Expenses",
      href: "/dashboard/expenses",
      icon: Wallet,
      roles: [UserRole.LANDLORD],
      color: "text-teal-500 dark:text-teal-400",
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: TrendingUp,
      roles: [UserRole.LANDLORD],
      color: "text-lime-600 dark:text-lime-400",
    },
    {
      title: "Rent Payments",
      href: "/dashboard/payments",
      icon: Wallet,
      roles: [UserRole.TENANT],
      color: "text-emerald-500 dark:text-emerald-400",
    },

    // ── Documents ───────────────────────────────────────────────────────────
    {
      title: "Documents",
      href: "/dashboard/documents",
      icon: FileStack,
      roles: [UserRole.LANDLORD, UserRole.TENANT],
      color: "text-sky-500 dark:text-sky-400",
    },
    {
      title: "My Lease",
      href: "/dashboard/my-lease",
      icon: FileText,
      roles: [UserRole.TENANT],
      color: "text-sky-600 dark:text-sky-300",
    },

    // ── Vendor ──────────────────────────────────────────────────────────────
    {
      title: "My Jobs",
      href: "/dashboard/vendor/tickets",
      icon: ClipboardList,
      roles: [UserRole.VENDOR],
      statKey: "myJobs",
      color: "text-amber-500 dark:text-amber-400",
    },
    {
      title: "Schedule",
      href: "/dashboard/vendor/schedule",
      icon: Calendar,
      roles: [UserRole.VENDOR],
      color: "text-orange-500 dark:text-orange-400",
    },
    {
      title: "My Invoices",
      href: "/dashboard/vendor/invoices",
      icon: Receipt,
      roles: [UserRole.VENDOR],
      statKey: "pendingInvoices",
      color: "text-yellow-500 dark:text-yellow-400",
    },
    {
      title: "Reviews",
      href: "/dashboard/vendor/reviews",
      icon: Star,
      roles: [UserRole.VENDOR],
      color: "text-amber-400 dark:text-amber-300",
    },

    // ── Admin ────────────────────────────────────────────────────────────────
    {
      title: "All Users",
      href: "/dashboard/users",
      icon: Users,
      roles: [UserRole.ADMIN],
      color: "text-slate-500 dark:text-slate-400",
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: [UserRole.ADMIN],
      color: "text-zinc-500 dark:text-zinc-400",
    },
    {
      title: "System",
      href: "/dashboard/system",
      icon: Shield,
      roles: [UserRole.ADMIN],
      color: "text-stone-500 dark:text-stone-400",
    },
  ];
};

// ============================================================================
// FETCH STATS
// ============================================================================
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchSidebarStats(role: UserRole): Promise<SidebarStats> {
  try {
    const response = await fetch("/api/stats/dashboard", {
      next: { revalidate: 30 },
      headers: { "Cache-Control": "max-age=30" },
    });
    if (!response.ok) {
      console.error("Failed to fetch stats:", response.statusText);
      return {};
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching sidebar stats:", error);
    return {};
  }
}

// ============================================================================
// NAV ITEM COMPONENT
// ============================================================================

const NavItemComponent = memo(
  ({
    item,
    isActive,
    isCollapsed,
    onMobileClose,
    statValue,
    badgeClasses,
  }: {
    item: NavItem;
    isActive: boolean;
    isCollapsed: boolean;
    onMobileClose?: () => void;
    statValue?: number;
    badgeClasses: string;
  }) => {
    const showBadge = statValue !== undefined && statValue > 0;
    const badgeLabel = statValue && statValue > 99 ? "99+" : String(statValue);

    return (
      <Link href={item.href} onClick={onMobileClose}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 relative overflow-visible",
            isActive && "bg-primary/10 text-primary hover:bg-primary/20",
            isCollapsed && "justify-center px-2"
          )}
        >
          {/* Icon */}
          <item.icon
            className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isActive
                ? "text-primary"
                : item.color || "text-slate-500 dark:text-slate-400"
            )}
          />

          {/* Expanded state: label + badge pill */}
          {!isCollapsed && (
            <>
              <span className="truncate">{item.title}</span>
              {showBadge && (
                <span
                  className={cn(
                    "ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    badgeClasses
                  )}
                >
                  {badgeLabel}
                </span>
              )}
            </>
          )}

          {/*
            Collapsed state: tiny number badge anchored to top-right of icon.
            Stays within the w-16 sidebar — no overflow bleeding out.
          */}
          {isCollapsed && showBadge && (
            <span
              className={cn(
                "absolute right-1 top-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-[3px] text-[9px] font-bold leading-none",
                badgeClasses
              )}
            >
              {badgeLabel}
            </span>
          )}
        </Button>
      </Link>
    );
  }
);

NavItemComponent.displayName = "NavItemComponent";

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

interface DashboardSidebarProps {
  role: UserRole;
  initialStats?: SidebarStats;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function DashboardSidebar({
  role,
  initialStats,
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState<SidebarStats>(initialStats || {});
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigation = useMemo(() => getNavigation(role), [role]);
  const filteredNav = useMemo(
    () => navigation.filter((item) => item.roles.includes(role)),
    [navigation, role]
  );
  const dashboardPath = useMemo(() => getDashboardPath(role), [role]);
  const badgeClasses = useMemo(() => getBadgeClasses(role), [role]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const loadStats = async () => {
      const newStats = await fetchSidebarStats(role);
      setStats(newStats);
    };
    if (!initialStats) loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [role, initialStats]);

  const handleToggle = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsCollapsed((prev) => !prev);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning]);

  const isNavItemActive = (itemHref: string): boolean => {
    if (pathname === itemHref) return true;
    if (itemHref === dashboardPath || itemHref === "/dashboard") {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref + "/");
  };

  // ── Inner sidebar body ──────────────────────────────────────────────────
  const SidebarContent = memo(({ isMobile = false }: { isMobile?: boolean }) => {
    const effectiveCollapsed = isMobile ? false : isCollapsed;
    const { theme } = useTheme();
    const logoSrc =
      !mounted
        ? "/propely-dark.svg"
        : theme === "dark"
        ? "/propely-dark.svg"
        : "/propely-light.svg";

    return (
      /*
        Scroll fix:
        - `min-h-0` on the outer div is the critical addition.
          Without it, a flex column child won't shrink below its natural
          content height, so ScrollArea never clips — it just grows forever.
        - ScrollArea gets `flex-1 min-h-0` so it fills remaining space
          and activates scrolling within that boundary.
        - No `overflow-y-auto` anywhere — ScrollArea owns scrolling entirely.
      */
      <div className="flex h-full min-h-0 flex-col">

        {/* Logo — fixed height, never enters scroll */}
        <div className="flex h-16 shrink-0 items-center px-6">
          {!effectiveCollapsed ? (
            <Link
              href="/"
              className="flex items-center gap-2.5"
              onClick={() => isMobile && onMobileClose()}
            >
              <Image
                src={logoSrc}
                alt="Propely"
                width={120}
                height={36}
                className="h-7 w-auto"
                priority
              />
            </Link>
          ) : (
            <Link
              href={dashboardPath}
              className="flex w-full items-center justify-center"
              onClick={() => isMobile && onMobileClose()}
            >
              <Home className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </Link>
          )}
        </div>

        {/* Scrollable nav area */}
        <ScrollArea className="flex-1 min-h-0 px-3">
          <nav className="flex flex-col gap-1 py-2">
            {filteredNav.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isActive={isNavItemActive(item.href)}
                isCollapsed={effectiveCollapsed}
                onMobileClose={isMobile ? onMobileClose : undefined}
                statValue={
                  item.statKey
                    ? stats[item.statKey as keyof SidebarStats]
                    : undefined
                }
                badgeClasses={badgeClasses}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Settings — pinned to bottom */}
        <div className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-800">
          <Link
            href="/dashboard/settings"
            onClick={() => isMobile && onMobileClose()}
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                pathname.startsWith("/dashboard/settings") &&
                  "bg-primary/10 text-primary",
                effectiveCollapsed && "justify-center px-2"
              )}
            >
              <Settings
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  pathname.startsWith("/dashboard/settings")
                    ? "text-primary"
                    : "text-slate-500 dark:text-slate-400"
                )}
              />
              {!effectiveCollapsed && (
                <span className="truncate">Settings</span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    );
  });

  SidebarContent.displayName = "SidebarContent";

  return (
    <>
      {/* MOBILE */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      {/* DESKTOP */}
      <div className="hidden lg:block">
        {/*
          Hover zone:
          Slightly wider than the sidebar (extra ~12px on right) so the
          cursor moving from the sidebar edge onto the protruding button
          does NOT trigger mouseleave — button stays visible.

          Toggle button:
          - Always mounted (never conditionally rendered)
          - Opacity transitions from 0 → 1 on hover via CSS
          - `transition-opacity duration-500` gives the slow, smooth fade
          - `pointer-events-none` when invisible so it can't intercept clicks
        */}
        <div
          className="fixed inset-y-0 left-0 z-50"
          style={{ width: isCollapsed ? "5rem" : "17.5rem" }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <aside
            className={cn(
              "flex h-full flex-col",
              "border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1e2021]",
              "transition-[width] duration-300 ease-in-out",
              isCollapsed ? "w-16" : "w-64"
            )}
          >
            <SidebarContent />
          </aside>

          {/* Collapse / expand toggle */}
          <button
            disabled={isTransitioning}
            onClick={handleToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "absolute -right-3 top-1/2 -translate-y-1/2 z-[60]",
              "flex h-7 w-7 items-center justify-center rounded-full",
              "border-2 border-slate-200 bg-white shadow-md",
              "hover:bg-slate-100 hover:shadow-lg hover:scale-110",
              "dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700",
              // Slow fade in/out — 500ms feels deliberate without being sluggish
              "transition-opacity duration-500 ease-in-out",
              isHovering && !isTransitioning
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>

        {/* Spacer — keeps page content pushed right of the sidebar */}
        <div
          className="transition-[width] duration-300 ease-in-out"
          style={{ width: isCollapsed ? "4rem" : "16rem" }}
        />
      </div>
    </>
  );
}