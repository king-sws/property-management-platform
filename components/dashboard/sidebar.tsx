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

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
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
// HELPER FUNCTIONS
// ============================================================================

const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.LANDLORD:
      return "/dashboard/landlord";
    case UserRole.TENANT:
      return "/dashboard/tenant";
    case UserRole.VENDOR:
      return "/dashboard/vendor";
    case UserRole.ADMIN:
      return "/dashboard/admin";
    default:
      return "/dashboard";
  }
};

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const getNavigation = (role: UserRole): NavItem[] => {
  const dashboardPath = getDashboardPath(role);
  
  return [
    {
      title: "Overview",
      href: dashboardPath,
      icon: LayoutDashboard,
      roles: [UserRole.LANDLORD, UserRole.TENANT, UserRole.VENDOR, UserRole.ADMIN],
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      roles: [UserRole.LANDLORD, UserRole.TENANT, UserRole.VENDOR, UserRole.ADMIN],
      statKey: "messages",
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Browse Apartments",
      href: "/dashboard/browse-properties",
      icon: Building2,
      roles: [UserRole.TENANT],
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Properties",
      href: "/dashboard/properties",
      icon: Building2,
      roles: [UserRole.LANDLORD],
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Tenants",
      href: "/dashboard/tenants",
      icon: Users,
      roles: [UserRole.LANDLORD],
      statKey: "tenants",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Leases",
      href: "/dashboard/leases",
      icon: FileText,
      roles: [UserRole.LANDLORD],
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Applications",
      href: "/dashboard/applications",
      icon: ClipboardList,
      roles: [UserRole.LANDLORD, UserRole.TENANT],
      statKey: "applications",
      color: "text-pink-600 dark:text-pink-400",
    },
    {
      title: "Maintenance",
      href: "/dashboard/maintenance",
      icon: Wrench,
      roles: [UserRole.LANDLORD, UserRole.TENANT],
      statKey: "maintenance",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Vendors",
      href: "/dashboard/vendors",
      icon: Briefcase,
      roles: [UserRole.LANDLORD],
      color: "text-teal-600 dark:text-teal-400",
    },
    {
      title: "Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
      roles: [UserRole.LANDLORD],
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: DollarSign,
      roles: [UserRole.LANDLORD],
      statKey: "payments",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Invoices",
      href: "/dashboard/invoices",
      icon: Receipt,
      roles: [UserRole.LANDLORD],
      color: "text-red-600 dark:text-red-400",
    },
    {
      title: "Expenses",
      href: "/dashboard/expenses",
      icon: Wallet,
      roles: [UserRole.LANDLORD],
      color: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: TrendingUp,
      roles: [UserRole.LANDLORD],
      color: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Documents",
      href: "/dashboard/documents",
      icon: FileStack,
      roles: [UserRole.LANDLORD, UserRole.TENANT],
      color: "text-sky-600 dark:text-sky-400",
    },
    {
      title: "My Lease",
      href: "/dashboard/my-lease",
      icon: FileText,
      roles: [UserRole.TENANT],
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Rent Payments",
      href: "/dashboard/payments",
      icon: Wallet,
      roles: [UserRole.TENANT],
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "My Jobs",
      href: "/dashboard/vendor/tickets",
      icon: ClipboardList,
      roles: [UserRole.VENDOR],
      statKey: "myJobs",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Schedule",
      href: "/dashboard/vendor/schedule",
      icon: Calendar,
      roles: [UserRole.VENDOR],
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "My Invoices",
      href: "/dashboard/vendor/invoices",
      icon: Receipt,
      roles: [UserRole.VENDOR],
      statKey: "pendingInvoices",
      color: "text-red-600 dark:text-red-400",
    },
    {
      title: "Reviews",
      href: "/dashboard/vendor/reviews",
      icon: Star,
      roles: [UserRole.VENDOR],
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "All Users",
      href: "/dashboard/users",
      icon: Users,
      roles: [UserRole.ADMIN],
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: [UserRole.ADMIN],
      color: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "System",
      href: "/dashboard/system",
      icon: Shield,
      roles: [UserRole.ADMIN],
      color: "text-slate-600 dark:text-slate-400",
    },
  ];
};

// ============================================================================
// FETCH STATS FUNCTION
// ============================================================================
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchSidebarStats(role: UserRole): Promise<SidebarStats> {
  try {
    const response = await fetch('/api/stats/dashboard', {
      next: { revalidate: 30 },
      headers: {
        'Cache-Control': 'max-age=30',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch stats:', response.statusText);
      return {};
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error fetching sidebar stats:', error);
    return {};
  }
}

// ============================================================================
// MEMOIZED NAVIGATION ITEM COMPONENT
// ============================================================================
const NavItemComponent = memo(({ 
  item, 
  isActive, 
  isCollapsed, 
  onMobileClose,
  statValue,
}: { 
  item: NavItem; 
  isActive: boolean; 
  isCollapsed: boolean;
  onMobileClose?: () => void;
  statValue?: number;
}) => {
  const showBadge = statValue !== undefined && statValue > 0;





  return (
    <Link href={item.href} onClick={onMobileClose}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 relative",
          isActive && "bg-primary/10 text-primary hover:bg-primary/20",
          isCollapsed && "justify-center px-2"
        )}
      >
        <item.icon className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive ? "text-primary" : item.color || "text-slate-600 dark:text-slate-400"
        )} />
        {!isCollapsed && (
          <>
            <span className="truncate">{item.title}</span>
            {showBadge && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium bg-primary/80 text-primary-foreground">
                {statValue > 99 ? "99+" : statValue}
              </span>
            )}
          </>
        )}
        {isCollapsed && showBadge && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        )}
      </Button>
    </Link>
  );
});

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
  onMobileClose
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState<SidebarStats>(initialStats || {});
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigation = useMemo(() => getNavigation(role), [role]);
  const filteredNav = useMemo(
    () => navigation.filter((item) => item.roles.includes(role)),
    [navigation, role]
  );
  const dashboardPath = useMemo(() => getDashboardPath(role), [role]);

  // Fetch stats on mount and periodically
  useEffect(() => {
    const loadStats = async () => {
      const newStats = await fetchSidebarStats(role);
      setStats(newStats);
    };

    if (!initialStats) {
      loadStats();
    }

    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, [role, initialStats]);

  // Handle toggle with transition lock
  const handleToggle = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsCollapsed(prev => !prev);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const isNavItemActive = (itemHref: string): boolean => {
    if (pathname === itemHref) return true;
    if (itemHref === dashboardPath || itemHref === "/dashboard") {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref + "/");
  };

  const SidebarContent = memo(({ isMobile = false }: { isMobile?: boolean }) => {
    const effectiveCollapsed = isMobile ? false : isCollapsed;

    const { theme } = useTheme();
    const logoSrc = theme === 'dark' ? '/propely-dark.svg' : '/propely-light.svg';
    
    return (
      <div className="flex h-full flex-col">
        {/* Logo */}
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
        className="h-9 w-auto"
        priority
      />
    </Link>
  ) : (
    <Link
      href={dashboardPath}
      className="flex items-center gap-2"
      onClick={() => isMobile && onMobileClose()}
    >
      <Home className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto" />
    </Link>
  )}
</div>

        {/* Navigation - Scrollable */}
<ScrollArea className="flex-1 px-3 overflow-y-auto">
  <nav className="flex flex-col gap-1 py-2">
    {filteredNav.map((item) => (
      <NavItemComponent 
        key={item.href} 
        item={item} 
        isActive={isNavItemActive(item.href)}
        isCollapsed={effectiveCollapsed}
        onMobileClose={isMobile ? onMobileClose : undefined}
        statValue={item.statKey ? stats[item.statKey as keyof SidebarStats] : undefined}
      />
    ))}
  </nav>
</ScrollArea>

        {/* Settings - Fixed at bottom */}
        <div className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-800">
          <Link 
            href="/dashboard/settings"
            onClick={() => isMobile && onMobileClose()}
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                pathname.startsWith("/dashboard/settings") && "bg-primary/10 text-primary",
                effectiveCollapsed && "justify-center px-2"
              )}
            >
              <Settings className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                pathname.startsWith("/dashboard/settings") 
                  ? "text-primary" 
                  : "text-slate-600 dark:text-slate-400"
              )} />
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
      {/* MOBILE SIDEBAR - Uses Sheet's built-in close button */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col",
            "border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1e2021]",
            "transition-[width] duration-300 ease-in-out",
            isCollapsed ? "w-16" : "w-64"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <SidebarContent />
          
          {/* Collapse Toggle Button */}
          {isHovering && (
            <Button
              variant="ghost"
              size="icon"
              disabled={isTransitioning}
              className={cn(
                "absolute -right-3 top-1/2 -translate-y-1/2 z-60",
                "h-8 w-8 rounded-full border-2",
                "border-slate-200 bg-white shadow-md",
                "hover:bg-slate-100 hover:shadow-lg hover:scale-110",
                "dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700",
                "transition-all duration-200",
                "animate-in fade-in zoom-in",
                isTransitioning && "cursor-not-allowed opacity-50"
              )}
              onClick={handleToggle}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </aside>

        {/* SPACER for desktop */}
        <div 
          className={cn(
            "transition-[width] duration-300 ease-in-out",
            isCollapsed ? "w-16" : "w-64"
          )} 
        />
      </div>
    </>
  );
}