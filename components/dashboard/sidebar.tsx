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
  section?: string; // section group label shown above this item
}

interface NavSection {
  label?: string;
  items: NavItem[];
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
// NAVIGATION — grouped into sections
// ============================================================================

interface NavSectionDef {
  label?: string;
  items: NavItem[];
}

const getNavSections = (role: UserRole): NavSectionDef[] => {
  const dashboardPath = getDashboardPath(role);

  // Landlord sections
  if (role === UserRole.LANDLORD) {
    return [
      {
        items: [
          { title: "Overview",    href: dashboardPath,             icon: LayoutDashboard, roles: [UserRole.LANDLORD] },
          { title: "Messages",    href: "/dashboard/messages",     icon: MessageSquare,   roles: [UserRole.LANDLORD], statKey: "messages" },
          { title: "Properties",  href: "/dashboard/properties",   icon: Building2,       roles: [UserRole.LANDLORD] },
          { title: "Tenants",     href: "/dashboard/tenants",      icon: Users,           roles: [UserRole.LANDLORD], statKey: "tenants" },
          { title: "Leases",      href: "/dashboard/leases",       icon: FileText,        roles: [UserRole.LANDLORD] },
          { title: "Applications",href: "/dashboard/applications", icon: ClipboardList,   roles: [UserRole.LANDLORD], statKey: "applications" },
          { title: "Vendors",     href: "/dashboard/vendors",      icon: Briefcase,       roles: [UserRole.LANDLORD] },
        ],
      },
      {
        label: "Operations",
        items: [
          { title: "Maintenance", href: "/dashboard/maintenance",  icon: Wrench,    roles: [UserRole.LANDLORD], statKey: "maintenance" },
          { title: "Schedule",    href: "/dashboard/schedule",     icon: Calendar,  roles: [UserRole.LANDLORD] },
        ],
      },
      {
        label: "Finance",
        items: [
          { title: "Payments",  href: "/dashboard/payments",  icon: DollarSign, roles: [UserRole.LANDLORD], statKey: "payments" },
          { title: "Invoices",  href: "/dashboard/invoices",  icon: Receipt,    roles: [UserRole.LANDLORD] },
          { title: "Expenses",  href: "/dashboard/expenses",  icon: Wallet,     roles: [UserRole.LANDLORD] },
        ],
      },
      {
        label: "Documents",
        items: [
          { title: "Documents", href: "/dashboard/documents", icon: FileStack,  roles: [UserRole.LANDLORD] },
        ],
      },
      {
        label: "Reports",
        items: [
          { title: "Reports",   href: "/dashboard/reports",   icon: TrendingUp, roles: [UserRole.LANDLORD] },
        ],
      },
    ];
  }

  // Tenant sections
  if (role === UserRole.TENANT) {
    return [
      {
        items: [
          { title: "Overview",          href: dashboardPath,                  icon: LayoutDashboard, roles: [UserRole.TENANT] },
          { title: "Messages",          href: "/dashboard/messages",          icon: MessageSquare,   roles: [UserRole.TENANT], statKey: "messages" },
          { title: "Browse Apartments", href: "/dashboard/browse-properties", icon: Building2,       roles: [UserRole.TENANT] },
          { title: "Applications",      href: "/dashboard/applications",      icon: ClipboardList,   roles: [UserRole.TENANT], statKey: "applications" },
        ],
      },
      {
        label: "My Tenancy",
        items: [
          { title: "My Lease",     href: "/dashboard/my-lease",   icon: FileText,  roles: [UserRole.TENANT] },
          { title: "Rent Payments",href: "/dashboard/payments",   icon: Wallet,    roles: [UserRole.TENANT] },
          { title: "Maintenance",  href: "/dashboard/maintenance",icon: Wrench,    roles: [UserRole.TENANT], statKey: "maintenance" },
        ],
      },
      {
        label: "Documents",
        items: [
          { title: "Documents", href: "/dashboard/documents", icon: FileStack, roles: [UserRole.TENANT] },
        ],
      },
    ];
  }

  // Vendor sections
  if (role === UserRole.VENDOR) {
    return [
      {
        items: [
          { title: "Overview", href: dashboardPath,           icon: LayoutDashboard, roles: [UserRole.VENDOR] },
          { title: "Messages", href: "/dashboard/messages",   icon: MessageSquare,   roles: [UserRole.VENDOR], statKey: "messages" },
        ],
      },
      {
        label: "Work",
        items: [
          { title: "My Jobs",    href: "/dashboard/vendor/tickets",  icon: ClipboardList, roles: [UserRole.VENDOR], statKey: "myJobs" },
          { title: "Schedule",   href: "/dashboard/vendor/schedule", icon: Calendar,      roles: [UserRole.VENDOR] },
          { title: "My Invoices",href: "/dashboard/vendor/invoices", icon: Receipt,       roles: [UserRole.VENDOR], statKey: "pendingInvoices" },
          { title: "Reviews",    href: "/dashboard/vendor/reviews",  icon: Star,          roles: [UserRole.VENDOR] },
        ],
      },
    ];
  }

  // Admin sections
  return [
    {
      items: [
        { title: "Overview", href: dashboardPath,         icon: LayoutDashboard, roles: [UserRole.ADMIN] },
        { title: "Messages", href: "/dashboard/messages", icon: MessageSquare,   roles: [UserRole.ADMIN], statKey: "messages" },
      ],
    },
    {
      label: "Management",
      items: [
        { title: "All Users",  href: "/dashboard/users",     icon: Users,     roles: [UserRole.ADMIN] },
        { title: "Analytics",  href: "/dashboard/analytics", icon: BarChart3, roles: [UserRole.ADMIN] },
        { title: "System",     href: "/dashboard/system",    icon: Shield,    roles: [UserRole.ADMIN] },
      ],
    },
  ];
};

// ============================================================================
// FETCH STATS
// ============================================================================
async function fetchSidebarStats(role: UserRole): Promise<SidebarStats> {
  try {
    const response = await fetch("/api/stats/dashboard", {
      next: { revalidate: 30 },
      headers: { "Cache-Control": "max-age=30" },
    });
    if (!response.ok) return {};
    return await response.json();
  } catch {
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
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 relative overflow-visible h-9 px-3",
            "text-sm font-medium rounded-md",
            // Default: readable text
            "text-slate-700 dark:text-slate-300",
            "hover:text-slate-900 dark:hover:text-white",
            "hover:bg-slate-100 dark:hover:bg-slate-800/60",
            // Active: dark navy highlight matching the screenshot
            isActive && [
              "bg-slate-200 dark:bg-[#1e3a5f]",
              "text-slate-900 dark:text-white",
              "hover:bg-slate-200 dark:hover:bg-[#1e3a5f]",
            ],
            isCollapsed && "justify-center px-2"
          )}
        >
          {/* Icon — same color as text, no individual color overrides */}
          <item.icon
            className={cn(
              "h-[18px] w-[18px] shrink-0",
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-300"
            )}
          />

          {/* Expanded: label + badge */}
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

          {/* Collapsed: tiny dot badge */}
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
// SECTION LABEL
// ============================================================================

const SectionLabel = ({ label, isCollapsed }: { label: string; isCollapsed: boolean }) => {
  if (isCollapsed) {
    // Render a short divider line instead of text when collapsed
    return <div className="mx-3 my-2 border-t border-slate-200 dark:border-slate-800" />;
  }
  return (
    <div className="mt-4 mb-1 px-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        {label}
      </span>
    </div>
  );
};

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

  const navSections = useMemo(() => getNavSections(role), [role]);
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
      <div className="flex h-full min-h-0 flex-col">

        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center px-4">
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
              <Home className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </Link>
          )}
        </div>

        {/* Scrollable nav */}
        <ScrollArea className="flex-1 min-h-0 px-2">
          <nav className="flex flex-col pb-4">
            {navSections.map((section, sIdx) => (
              <div key={sIdx}>
                {/* Section label (skip for the first unlabeled section) */}
                {section.label && (
                  <SectionLabel label={section.label} isCollapsed={effectiveCollapsed} />
                )}

                {/* Items */}
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {section.items.map((item) => (
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
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Settings — pinned bottom */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-2">
          <Link
            href="/dashboard/settings"
            onClick={() => isMobile && onMobileClose()}
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-9 px-3 text-sm font-medium rounded-md",
                "text-slate-700 dark:text-slate-300",
                "hover:text-slate-900 dark:hover:text-white",
                "hover:bg-slate-100 dark:hover:bg-slate-800/60",
                pathname.startsWith("/dashboard/settings") && [
                  "bg-slate-200 dark:bg-[#1e3a5f]",
                  "text-slate-900 dark:text-white",
                ],
                effectiveCollapsed && "justify-center px-2"
              )}
            >
              <Settings
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  pathname.startsWith("/dashboard/settings")
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                )}
              />
              {!effectiveCollapsed && <span className="truncate">Settings</span>}
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

        {/* Spacer */}
        <div
          className="transition-[width] duration-300 ease-in-out"
          style={{ width: isCollapsed ? "4rem" : "16rem" }}
        />
      </div>
    </>
  );
}