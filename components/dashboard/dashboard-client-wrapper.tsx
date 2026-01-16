// components/dashboard/dashboard-client-wrapper.tsx
"use client";

import { useState } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardHeader } from "./header";
import { UserRole } from "@/lib/generated/prisma/enums";

interface SidebarStats {
  applications?: number;
  maintenance?: number;
  messages?: number;
  payments?: number;
  tenants?: number;
  myJobs?: number;
  pendingInvoices?: number;
}

interface DashboardClientWrapperProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    status?: string;
  };
  role: UserRole;
  initialStats: SidebarStats;
  unreadCount: number;
  urgentItems?: {
    maintenanceRequests?: number;
    expiringLeases?: number;
    overduePayments?: number;
  };
  children: React.ReactNode;
}

export function DashboardClientWrapper({
  user,
  role,
  initialStats,
  unreadCount,
  urgentItems,
  children,
}: DashboardClientWrapperProps) {
  // ⭐ Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ⭐ Toggle handler for header
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // ⭐ Close handler for sidebar
  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#181a1b]">
      {/* Sidebar with mobile state */}
      <DashboardSidebar
        role={role}
        initialStats={initialStats}
        mobileOpen={mobileMenuOpen}
        onMobileClose={handleMobileMenuClose}
      />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Header with toggle handler */}
        <DashboardHeader
          user={user}
          unreadCount={unreadCount}
          urgentItems={urgentItems}
          onMobileMenuToggle={handleMobileMenuToggle}
        />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}