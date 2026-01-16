// app/(dashboard)/dashboard/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Typography } from "@/components/ui/typography";
import { Container, Stack } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  Building2, 
  DollarSign, 
  AlertCircle,
  TrendingUp,
  UserCheck,
  Home,
  Wrench,
  FileText,
  Activity,
  Crown,
  Shield,
  Ban,
  CheckCircle2
} from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Dashboard | Propely",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    const rolePath = session.user.role?.toLowerCase();
    redirect(`/dashboard/${rolePath}`);
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2" className="mb-1 flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              Admin Dashboard
            </Typography>
            <Typography variant="muted">
              System-wide overview and management
            </Typography>
          </div>
          <Badge variant="outline" className="text-sm">
            <Shield className="mr-1 h-3 w-3" />
            Administrator Access
          </Badge>
        </div>

        {/* System Overview Stats */}
        <Suspense fallback={<StatsLoading />}>
          <SystemOverview />
        </Suspense>

        {/* Platform Metrics */}
        <Suspense fallback={<StatsLoading />}>
          <PlatformMetrics />
        </Suspense>

        {/* Two Column Layout */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Users */}
          <Suspense fallback={<CardLoading title="Recent Users" />}>
            <RecentUsers />
          </Suspense>

          {/* Subscription Overview */}
          <Suspense fallback={<CardLoading title="Subscriptions" />}>
            <SubscriptionOverview />
          </Suspense>
        </div>

        {/* System Alerts */}
        <Suspense fallback={<CardLoading title="System Alerts" />}>
          <SystemAlerts />
        </Suspense>

        {/* Activity Overview */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Suspense fallback={<CardLoading title="Properties" />}>
            <PropertyStats />
          </Suspense>

          <Suspense fallback={<CardLoading title="Payments" />}>
            <PaymentStats />
          </Suspense>

          <Suspense fallback={<CardLoading title="Maintenance" />}>
            <MaintenanceStats />
          </Suspense>
        </div>

        {/* Recent Activity */}
        <Suspense fallback={<CardLoading title="Recent Activity" />}>
          <RecentActivity />
        </Suspense>
      </Stack>
    </Container>
  );
}

// -------------------------
// System Overview Component
// -------------------------
async function SystemOverview() {
  const [
    totalUsers,
    activeUsers,
    totalLandlords,
    totalTenants,
    totalVendors,
    suspendedUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ 
      where: { 
        deletedAt: null,
        status: "ACTIVE"
      } 
    }),
    prisma.landlord.count({ where: { deletedAt: null } }),
    prisma.tenant.count({ where: { deletedAt: null } }),
    prisma.vendor.count({ where: { deletedAt: null } }),
    prisma.user.count({ 
      where: { 
        deletedAt: null,
        status: "SUSPENDED"
      } 
    }),
  ]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: `${activeUsers} active`,
      variant: "default" as const,
    },
    {
      title: "Landlords",
      value: totalLandlords,
      icon: Building2,
      description: "Property managers",
      variant: "default" as const,
    },
    {
      title: "Tenants",
      value: totalTenants,
      icon: UserCheck,
      description: "Renters",
      variant: "default" as const,
    },
    {
      title: "Vendors",
      value: totalVendors,
      icon: Wrench,
      description: "Service providers",
      variant: "default" as const,
    },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {suspendedUsers > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm">Suspended Accounts</CardTitle>
              <Badge variant="destructive" className="ml-auto">{suspendedUsers}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin/users?status=SUSPENDED">
                Review Suspended Accounts
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// -------------------------
// Platform Metrics Component
// -------------------------
async function PlatformMetrics() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalProperties,
    totalUnits,
    occupiedUnits,
    currentMonthRevenue,
    lastMonthRevenue,
    newUsersThisMonth,
    newUsersLastMonth,
  ] = await Promise.all([
    prisma.property.count({ 
      where: { 
        deletedAt: null,
        isActive: true 
      } 
    }),
    prisma.unit.count({ 
      where: { 
        deletedAt: null,
        isActive: true 
      } 
    }),
    prisma.unit.count({ 
      where: { 
        deletedAt: null,
        isActive: true,
        status: "OCCUPIED"
      } 
    }),
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        paidAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
      _sum: { netAmount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        paidAt: {
          gte: new Date(today.getFullYear(), today.getMonth() - 1, 1),
          lt: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
      _sum: { netAmount: true },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        deletedAt: null,
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { 
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo 
        },
        deletedAt: null,
      },
    }),
  ]);

  const occupancyRate = totalUnits > 0 
    ? Math.round((occupiedUnits / totalUnits) * 100) 
    : 0;

  const currentRevenue = Number(currentMonthRevenue._sum.netAmount || 0);
  const lastRevenue = Number(lastMonthRevenue._sum.netAmount || 0);
  const revenueChange = lastRevenue > 0 
    ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 
    : 0;

  const userGrowth = newUsersLastMonth > 0
    ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
    : 0;

  const metrics = [
    {
      title: "Total Properties",
      value: totalProperties,
      icon: Building2,
      description: `${totalUnits} units total`,
      trend: null,
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: Home,
      description: `${occupiedUnits} of ${totalUnits} occupied`,
      trend: occupancyRate >= 90 ? "positive" : occupancyRate >= 75 ? "neutral" : "negative",
    },
    {
      title: "Monthly Revenue",
      value: `$${currentRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% vs last month`,
      trend: revenueChange >= 0 ? "positive" : "negative",
    },
    {
      title: "New Users (30d)",
      value: newUsersThisMonth,
      icon: TrendingUp,
      description: `${userGrowth >= 0 ? '+' : ''}${userGrowth.toFixed(1)}% growth`,
      trend: userGrowth >= 0 ? "positive" : "negative",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className={`text-xs ${
              metric.trend === "positive" ? "text-green-600" :
              metric.trend === "negative" ? "text-red-600" :
              "text-muted-foreground"
            }`}>
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// -------------------------
// Recent Users Component
// -------------------------
async function RecentUsers() {
  const recentUsers = await prisma.user.findMany({
    where: { deletedAt: null },
    include: {
      landlordProfile: true,
      tenantProfile: true,
      vendorProfile: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Users</CardTitle>
          <Badge variant="secondary">{recentUsers.length}</Badge>
        </div>
        <CardDescription>Latest user registrations</CardDescription>
      </CardHeader>
      <CardContent>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No users yet
          </p>
        ) : (
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{user.name || user.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                    {user.status === "ACTIVE" ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : user.status === "SUSPENDED" ? (
                      <Ban className="h-3 w-3 text-red-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-600" />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button asChild className="w-full mt-4" variant="outline">
          <Link href="/dashboard/admin/users">Manage All Users</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// -------------------------
// Subscription Overview Component
// -------------------------
async function SubscriptionOverview() {
  const subscriptionStats = await prisma.landlord.groupBy({
    by: ['subscriptionTier', 'subscriptionStatus'],
    where: { deletedAt: null },
    _count: true,
  });

  const trialCount = subscriptionStats
    .filter(s => s.subscriptionStatus === 'TRIAL')
    .reduce((sum, s) => sum + s._count, 0);

  const activeCount = subscriptionStats
    .filter(s => s.subscriptionStatus === 'ACTIVE')
    .reduce((sum, s) => sum + s._count, 0);

  const inactiveCount = subscriptionStats
    .filter(s => s.subscriptionStatus === 'INACTIVE')
    .reduce((sum, s) => sum + s._count, 0);

  const pastDueCount = subscriptionStats
    .filter(s => s.subscriptionStatus === 'PAST_DUE')
    .reduce((sum, s) => sum + s._count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
        <CardDescription>Landlord subscription status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Active</span>
            </div>
            <span className="text-sm font-semibold">{activeCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm">Trial</span>
            </div>
            <span className="text-sm font-semibold">{trialCount}</span>
          </div>
          
          {pastDueCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Past Due</span>
              </div>
              <span className="text-sm font-semibold">{pastDueCount}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <span className="text-sm">Inactive</span>
            </div>
            <span className="text-sm font-semibold">{inactiveCount}</span>
          </div>
        </div>
        
        <Button asChild className="w-full mt-4" variant="outline">
          <Link href="/dashboard/admin/subscriptions">View All Subscriptions</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// -------------------------
// System Alerts Component
// -------------------------
async function SystemAlerts() {
  const today = new Date();
  
  const [
    pendingVerifications,
    expiringSoonLeases,
    overduePayments,
    urgentTickets,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        status: "PENDING_VERIFICATION",
        deletedAt: null,
      },
    }),
    prisma.lease.count({
      where: {
        status: "EXPIRING_SOON",
        endDate: {
          lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        deletedAt: null,
      },
    }),
    prisma.payment.count({
      where: {
        status: "PENDING",
        dueDate: {
          lt: today,
        },
      },
    }),
    prisma.maintenanceTicket.count({
      where: {
        priority: "URGENT",
        status: {
          in: ["OPEN", "IN_PROGRESS"],
        },
        deletedAt: null,
      },
    }),
  ]);

  const alerts = [
    {
      title: "Pending Verifications",
      count: pendingVerifications,
      severity: "warning" as const,
      link: "/dashboard/admin/users?status=PENDING_VERIFICATION",
    },
    {
      title: "Leases Expiring Soon",
      count: expiringSoonLeases,
      severity: "info" as const,
      link: "/dashboard/admin/leases?status=EXPIRING_SOON",
    },
    {
      title: "Overdue Payments",
      count: overduePayments,
      severity: "error" as const,
      link: "/dashboard/admin/payments?status=OVERDUE",
    },
    {
      title: "Urgent Tickets",
      count: urgentTickets,
      severity: "error" as const,
      link: "/dashboard/admin/maintenance?priority=URGENT",
    },
  ].filter(alert => alert.count > 0);

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            ✨ All systems running smoothly. No alerts at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            System Alerts
          </CardTitle>
          <Badge variant="destructive">{alerts.length}</Badge>
        </div>
        <CardDescription>Items requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <Link
              key={index}
              href={alert.link}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${
                  alert.severity === "error" ? "bg-red-500" :
                  alert.severity === "warning" ? "bg-yellow-500" :
                  "bg-blue-500"
                }`} />
                <span className="text-sm font-medium">{alert.title}</span>
              </div>
              <Badge variant={
                alert.severity === "error" ? "destructive" :
                alert.severity === "warning" ? "secondary" :
                "outline"
              }>
                {alert.count}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------------
// Property Stats Component
// -------------------------
async function PropertyStats() {
  const [totalProperties, activeProperties, vacantUnits] = await Promise.all([
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.property.count({ 
      where: { 
        deletedAt: null,
        isActive: true 
      } 
    }),
    prisma.unit.count({ 
      where: { 
        deletedAt: null,
        status: "VACANT"
      } 
    }),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">{totalProperties}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Active</span>
          <span className="font-semibold">{activeProperties}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Vacant Units</span>
          <span className="font-semibold">{vacantUnits}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------------
// Payment Stats Component
// -------------------------
async function PaymentStats() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [monthlyRevenue, pendingPayments, completedPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        paidAt: { gte: firstDayOfMonth },
      },
      _sum: { netAmount: true },
    }),
    prisma.payment.count({
      where: { status: "PENDING" },
    }),
    prisma.payment.count({
      where: {
        status: "COMPLETED",
        paidAt: { gte: firstDayOfMonth },
      },
    }),
  ]);

  const revenue = Number(monthlyRevenue._sum.netAmount || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">This Month</span>
          <span className="font-semibold">${revenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Completed</span>
          <span className="font-semibold">{completedPayments}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pending</span>
          <span className="font-semibold">{pendingPayments}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------------
// Maintenance Stats Component
// -------------------------
async function MaintenanceStats() {
  const [openTickets, urgentTickets, completedThisMonth] = await Promise.all([
    prisma.maintenanceTicket.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        deletedAt: null,
      },
    }),
    prisma.maintenanceTicket.count({
      where: {
        priority: "URGENT",
        status: { in: ["OPEN", "IN_PROGRESS"] },
        deletedAt: null,
      },
    }),
    prisma.maintenanceTicket.count({
      where: {
        status: "COMPLETED",
        completedDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        deletedAt: null,
      },
    }),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Maintenance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Open Tickets</span>
          <span className="font-semibold">{openTickets}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Urgent</span>
          <span className="font-semibold text-red-600">{urgentTickets}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Completed (Month)</span>
          <span className="font-semibold">{completedThisMonth}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------------
// Recent Activity Component
// -------------------------
async function RecentActivity() {
  const activities = await prisma.activityLog.findMany({
    where: {
      type: {
        in: [
          "USER_LOGIN",
          "PROPERTY_CREATED",
          "LEASE_CREATED",
          "PAYMENT_MADE",
          "TICKET_CREATED",
        ],
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Badge variant="secondary">{activities.length}</Badge>
        </div>
        <CardDescription>Latest system activities</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm border-b pb-3 last:border-0">
                <div className="mt-1">
                  {activity.type === "USER_LOGIN" && <Users className="h-4 w-4 text-blue-600" />}
                  {activity.type === "PROPERTY_CREATED" && <Building2 className="h-4 w-4 text-green-600" />}
                  {activity.type === "LEASE_CREATED" && <FileText className="h-4 w-4 text-purple-600" />}
                  {activity.type === "PAYMENT_MADE" && <DollarSign className="h-4 w-4 text-green-600" />}
                  {activity.type === "TICKET_CREATED" && <Wrench className="h-4 w-4 text-orange-600" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{activity.action}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.user?.name || "System"}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.user?.role || "SYSTEM"}
                    </Badge>
                    <span>•</span>
                    <span>{new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -------------------------
// Loading Components
// -------------------------
function StatsLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CardLoading({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}