/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/(admin)/users/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Container, Grid, Stack } from "@/components/ui/container";
import { UserCard } from "@/components/admin/user-card";
import { Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UsersTable } from "@/components/admin/users-table";
import { ViewToggle } from "@/components/admin/view-toggle";

interface UsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const role = typeof params.role === "string" ? params.role : "all";
  const status = typeof params.status === "string" ? params.status : "all";
  const view = typeof params.view === "string" ? params.view : "card";

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Users Management
            </Typography>
            <Typography variant="muted">
              Manage all platform users and their accounts
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle currentView={view} />
            <CreateUserDialog />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-10"
              defaultValue={search}
            />
          </div>
          <Select defaultValue={role}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="LANDLORD">Landlord</SelectItem>
              <SelectItem value="TENANT">Tenant</SelectItem>
              <SelectItem value="VENDOR">Vendor</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue={status}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING_VERIFICATION">Pending</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Grid/Table */}
        <Suspense fallback={<UsersLoading view={view} />}>
          <UsersList search={search} role={role} status={status} view={view} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function UsersList({
  search,
  role,
  status,
  view,
}: {
  search: string;
  role: string;
  status: string;
  view: string;
}) {
  const whereClause: any = {
    deletedAt: null,
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && role !== "all") {
    whereClause.role = role;
  }

  if (status && status !== "all") {
    whereClause.status = status;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      landlordProfile: {
        include: {
          _count: {
            select: {
              properties: {
                where: { deletedAt: null, isActive: true },
              },
            },
          },
        },
      },
      tenantProfile: {
        include: {
          leaseMembers: {
            where: {
              lease: {
                status: "ACTIVE",
              },
            },
            include: {
              lease: true,
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
      },
      vendorProfile: {
        include: {
          _count: {
            select: {
              tickets: true,
              reviews: true,
            },
          },
        },
      },
      _count: {
        select: {
          activityLogs: true,
          notifications: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12" />}
        title={search ? "No users found" : "No users yet"}
        description={
          search
            ? "Try adjusting your search or filters"
            : "Users will appear here once they register"
        }
        action={
          !search && (
            <Link href="/dashboard/users/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </Link>
          )
        }
      />
    );
  }

  const formattedUsers = users.map((user) => {
    // Calculate role-specific stats
    let roleStats: any = {};

    if (user.role === "LANDLORD" && user.landlordProfile) {
      roleStats = {
        properties: user.landlordProfile._count.properties,
        subscription: user.landlordProfile.subscriptionTier,
        subscriptionStatus: user.landlordProfile.subscriptionStatus,
      };
    } else if (user.role === "TENANT" && user.tenantProfile) {
      const activeLeases = user.tenantProfile.leaseMembers.filter(
        (lm) => lm.lease.status === "ACTIVE"
      );
      roleStats = {
        activeLeases: activeLeases.length,
        totalPayments: user.tenantProfile._count.payments,
      };
    } else if (user.role === "VENDOR" && user.vendorProfile) {
      roleStats = {
        completedTickets: user.vendorProfile._count.tickets,
        reviews: user.vendorProfile._count.reviews,
        rating: user.vendorProfile.rating
          ? Number(user.vendorProfile.rating)
          : null,
      };
    }

    return {
      id: user.id,
      name: user.name || "Unnamed User",
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar || user.image,
      createdAt: user.createdAt,
      lastActive: user.updatedAt,
      activityCount: user._count.activityLogs,
      notificationCount: user._count.notifications,
      roleStats,
    };
  });

  if (view === "table") {
    return <UsersTable users={formattedUsers} />;
  }

  return (
    <Grid cols={3} gap="lg">
      {formattedUsers.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </Grid>
  );
}

function UsersLoading({ view }: { view: string }) {
  if (view === "table") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Grid cols={3} gap="lg">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </Grid>
  );
}