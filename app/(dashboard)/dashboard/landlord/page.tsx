/* eslint-disable react/no-unescaped-entities */
// app/(dashboard)/dashboard/landlord/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Typography } from "@/components/ui/typography";
import { Container, Stack } from "@/components/ui/container";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { MaintenanceOverview } from "@/components/dashboard/maintenance-overview";
import { PaymentChart } from "@/components/dashboard/payment-chart";
import { Building2, Users, DollarSign, Wrench, AlertTriangle, TrendingUp, Calendar, Home } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickStats } from "@/components/dashboard/stats-cards";
import { PendingSignaturesWidget } from "@/components/dashboard/pending-signatures-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubscriptionWidget } from "@/components/dashboard/subscription-widget";
import { WelcomeTrialBanner } from "@/components/dashboard/welcome-trial-banner";

export const metadata = {
  title: "Landlord Dashboard | Propely",
};

export default async function LandlordDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "LANDLORD") {
    const rolePath = session.user.role?.toLowerCase();
    redirect(`/dashboard/${rolePath}`);
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div>
          <Typography variant="h2" className="mb-1">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}!
          </Typography>
          <Typography variant="muted">
            Here's what's happening with your properties today.
          </Typography>
        </div>

        {/* Stats Overview */}
        <Suspense fallback={<StatsLoading />}>
          <StatsOverview userId={session.user.id} />
        </Suspense>

        {/* Financial Metrics */}
        <Suspense fallback={<StatsLoading />}>
          <FinancialMetrics userId={session.user.id} />
        </Suspense>

        <WelcomeTrialBanner />

        {/* Subscription Status Widget */}
        <Suspense fallback={<CardLoading title="Subscription" />}>
          <SubscriptionWidget />
        </Suspense>

        {/* Pending Signatures */}
        <Suspense fallback={<CardLoading title="Pending Signatures" />}>
          <PendingSignaturesWidget />
        </Suspense>

        {/* Outstanding Payments Alert */}
        <Suspense fallback={<CardLoading title="Outstanding Payments" />}>
          <OutstandingPayments userId={session.user.id} />
        </Suspense>

        {/* Charts & Activity */}
        <div className="grid gap-4 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <Suspense fallback={<ChartLoading />}>
              <PaymentChart userId={session.user.id} />
            </Suspense>
          </div>

          <div className="lg:col-span-3">
            <Suspense fallback={<ActivityLoading />}>
              <RecentActivity userId={session.user.id} />
            </Suspense>
          </div>
        </div>

        {/* Leases & Vacant Units */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Suspense fallback={<CardLoading title="Expiring Leases" />}>
            <ExpiringLeases userId={session.user.id} />
          </Suspense>

          <Suspense fallback={<CardLoading title="Vacant Units" />}>
            <VacantUnits userId={session.user.id} />
          </Suspense>
        </div>

        {/* Maintenance */}
        <Suspense fallback={<CardLoading title="Maintenance Requests" />}>
          <MaintenanceOverview userId={session.user.id} />
        </Suspense>
      </Stack>
    </Container>
  );
}

// -------------------------
// Stats Overview Component
// -------------------------
async function StatsOverview({ userId }: { userId: string }) {
  const landlord = await prisma.landlord.findUnique({
    where: { userId },
    include: {
      properties: {
        where: { deletedAt: null, isActive: true },
        include: {
          units: {
            where: { deletedAt: null, isActive: true },
          },
        },
      },
    },
  });

  if (!landlord) return null;

  const totalProperties = landlord.properties.length;
  const totalUnits = landlord.properties.reduce(
    (acc, prop) => acc + prop.units.length,
    0
  );
  const occupiedUnits = landlord.properties.reduce(
    (acc, prop) => acc + prop.units.filter(unit => unit.status === "OCCUPIED").length,
    0
  );
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  const payments = await prisma.payment.aggregate({
    where: {
      lease: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      status: "COMPLETED",
      paidAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const monthlyRevenue = Number(payments._sum.amount || 0);

  const openTickets = await prisma.maintenanceTicket.count({
    where: {
      property: {
        landlordId: landlord.id,
      },
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
      deletedAt: null,
    },
  });

  const stats = [
    {
      title: "Total Properties",
      value: totalProperties,
      icon: Building2,
      description: "Active properties",
      variant: "default" as const,
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: Users,
      description: `${occupiedUnits} of ${totalUnits} units`,
      variant: occupancyRate >= 90 ? ("success" as const) : ("default" as const),
    },
    {
      title: "Monthly Revenue",
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "This month",
      variant: "success" as const,
    },
    {
      title: "Open Tickets",
      value: openTickets,
      icon: Wrench,
      description: "Maintenance requests",
      variant: openTickets > 5 ? ("warning" as const) : ("default" as const),
    },
  ];

  return <QuickStats stats={stats} />;
}

// -------------------------
// Financial Metrics Component
// -------------------------
async function FinancialMetrics({ userId }: { userId: string }) {
  const landlord = await prisma.landlord.findUnique({
    where: { userId },
  });

  if (!landlord) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const lastYear = currentYear - 1;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentMonth = today.getMonth();

  // Current year revenue
  const currentYearRevenue = await prisma.payment.aggregate({
    where: {
      lease: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      status: "COMPLETED",
      paidAt: {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31, 23, 59, 59),
      },
    },
    _sum: { netAmount: true },
  });

  // Last year revenue
  const lastYearRevenue = await prisma.payment.aggregate({
    where: {
      lease: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      status: "COMPLETED",
      paidAt: {
        gte: new Date(lastYear, 0, 1),
        lte: new Date(lastYear, 11, 31, 23, 59, 59),
      },
    },
    _sum: { netAmount: true },
  });

  // Collection rate (last 12 months)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      type: "RENT",
      status: "COMPLETED",
      paidAt: {
        gte: startDate,
      },
    },
    select: {
      dueDate: true,
      paidAt: true,
    },
  });

  const totalPayments = payments.length;
  const onTimePayments = payments.filter(
    p => p.dueDate && p.paidAt && p.paidAt <= p.dueDate
  ).length;
  const collectionRate = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 100;

  const currentYearTotal = Number(currentYearRevenue._sum.netAmount || 0);
  const lastYearTotal = Number(lastYearRevenue._sum.netAmount || 0);
  const yearOverYearChange = lastYearTotal > 0 
    ? ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100 
    : 0;

  const metrics = [
    {
      title: "YoY Revenue Growth",
      value: `${yearOverYearChange >= 0 ? '+' : ''}${yearOverYearChange.toFixed(1)}%`,
      icon: TrendingUp,
      description: `$${currentYearTotal.toLocaleString()} vs $${lastYearTotal.toLocaleString()}`,
      variant: yearOverYearChange >= 0 ? ("success" as const) : ("warning" as const),
    },
    {
      title: "Collection Rate",
      value: `${collectionRate.toFixed(1)}%`,
      icon: DollarSign,
      description: `${onTimePayments} of ${totalPayments} on time`,
      variant: collectionRate >= 90 ? ("success" as const) : ("warning" as const),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// -------------------------
// Outstanding Payments Component
// -------------------------
async function OutstandingPayments({ userId }: { userId: string }) {
  const landlord = await prisma.landlord.findUnique({
    where: { userId },
  });

  if (!landlord) return null;

  const today = new Date();

  const overduePayments = await prisma.payment.findMany({
    where: {
      lease: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      status: "PENDING",
      dueDate: {
        lt: today,
      },
    },
    include: {
      tenant: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      lease: {
        include: {
          unit: {
            include: {
              property: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  const overdueTotal = overduePayments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (overduePayments.length === 0) return null;

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Outstanding Payments</CardTitle>
          </div>
          <Badge variant="destructive">{overduePayments.length} Overdue</Badge>
        </div>
        <CardDescription>
          Total overdue: ${overdueTotal.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {overduePayments.map((payment) => {
            const daysOverdue = payment.dueDate 
              ? Math.floor((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {payment.tenant.user.name} - {payment?.lease?.unit?.property?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unit {payment?.lease?.unit.unitNumber} • {daysOverdue} days overdue
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-destructive">
                    ${Number(payment.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {payment.dueDate?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <Button asChild className="w-full mt-4" variant="outline">
          <Link href="/dashboard/payments">View All Payments</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// -------------------------
// Expiring Leases Component
// -------------------------
async function ExpiringLeases({ userId }: { userId: string }) {
  const landlord = await prisma.landlord.findUnique({
    where: { userId },
  });

  if (!landlord) return null;

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 90); // Next 90 days

  const expiringLeases = await prisma.lease.findMany({
    where: {
      unit: {
        property: {
          landlordId: landlord.id,
        },
      },
      status: {
        in: ["ACTIVE", "EXPIRING_SOON"],
      },
      endDate: {
        gte: today,
        lte: futureDate,
      },
      deletedAt: null,
    },
    include: {
      unit: {
        include: {
          property: {
            select: {
              name: true,
            },
          },
        },
      },
      tenants: {
        where: {
          isPrimaryTenant: true,
        },
        include: {
          tenant: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      endDate: "asc",
    },
    take: 5,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Expiring Leases</CardTitle>
          </div>
          <Badge variant="secondary">{expiringLeases.length}</Badge>
        </div>
        <CardDescription>
          Leases ending in the next 90 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expiringLeases.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No leases expiring soon
          </p>
        ) : (
          <div className="space-y-4">
            {expiringLeases.map((lease) => {
              const daysUntilExpiry = lease.endDate 
                ? Math.ceil((lease.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                : 0;

              return (
                <div key={lease.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {lease.tenants[0]?.tenant.user.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lease.unit.property.name} - Unit {lease.unit.unitNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={daysUntilExpiry < 30 ? "destructive" : "secondary"}
                    >
                      {daysUntilExpiry} days
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lease.endDate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Button asChild className="w-full mt-4" variant="outline">
          <Link href="/dashboard/leases">Manage Leases</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// -------------------------
// Vacant Units Component
// -------------------------
async function VacantUnits({ userId }: { userId: string }) {
  const landlord = await prisma.landlord.findUnique({
    where: { userId },
  });

  if (!landlord) return null;

  const vacantUnits = await prisma.unit.findMany({
    where: {
      property: {
        landlordId: landlord.id,
        deletedAt: null,
      },
      status: "VACANT",
      isActive: true,
      deletedAt: null,
    },
    include: {
      property: {
        select: {
          name: true,
        },
      },
      applications: {
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW"], 
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  const potentialRevenue = vacantUnits.reduce(
    (sum, unit) => sum + Number(unit.rentAmount || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Vacant Units</CardTitle>
          </div>
          <Badge variant="secondary">{vacantUnits.length}</Badge>
        </div>
        <CardDescription>
          Potential revenue: ${potentialRevenue.toLocaleString()}/month
        </CardDescription>
      </CardHeader>
      <CardContent>
        {vacantUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No vacant units
          </p>
        ) : (
          <div className="space-y-4">
            {vacantUnits.map((unit) => (
              <div key={unit.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {unit?.property?.name} - Unit {unit.unitNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {unit.bedrooms} bed, {Number(unit.bathrooms)} bath
                    {unit?.applications?.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {unit.applications.length} application(s)
                      </Badge>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ${Number(unit.rentAmount).toLocaleString()}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button asChild className="w-full mt-4" variant="outline">
          <Link href="/dashboard/properties">View Properties</Link>
        </Button>
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
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-75 w-full" />
      </CardContent>
    </Card>
  );
}

function ActivityLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
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