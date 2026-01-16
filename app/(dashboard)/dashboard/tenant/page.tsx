/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// 2. UPDATE: app/(dashboard)/dashboard/tenant/page.tsx
// ============================================================================

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Container, Stack } from "@/components/ui/container";
import { FileText, DollarSign, Wrench, Calendar, AlertCircle } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickStats } from "@/components/dashboard/stats-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { PendingSignaturesWidget } from "@/components/dashboard/pending-signatures-widget";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getTenantDashboardStats,
  getTenantRecentPayments,
  getTenantMaintenanceRequests,
  getUpcomingLeaseActions,
} from "@/actions/tenant-dashboard";

export const metadata = {
  title: "Tenant Dashboard | Propely",
};

export default async function TenantDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "TENANT") {
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
            Manage your lease, payments, and maintenance requests.
          </Typography>
        </div>

        {/* Quick Stats */}
        <Suspense fallback={<StatsLoading />}>
          <TenantStats />
        </Suspense>

        {/* Upcoming Actions Alert */}
        <Suspense fallback={null}>
          <UpcomingActions />
        </Suspense>

        {/* Pending Signatures */}
        <Suspense fallback={<StatsLoading />}>
          <PendingSignaturesWidget />
        </Suspense>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Suspense fallback={<CardLoading title="Active Lease" />}>
            <ActiveLease />
          </Suspense>

          <Suspense fallback={<CardLoading title="Recent Payments" />}>
            <RecentPayments />
          </Suspense>
        </div>

        {/* Maintenance Requests */}
        <Suspense fallback={<CardLoading title="Maintenance Requests" />}>
          <MaintenanceRequests />
        </Suspense>
      </Stack>
    </Container>
  );
}

// ============================================================================
// Component: Tenant Stats
// ============================================================================
async function TenantStats() {
  const result = await getTenantDashboardStats();

  if (!result.success || !result.data) {
    return null;
  }

  const { lease, payments, maintenance } = result.data;

  const stats = [
    {
      title: "Lease Status",
      value: lease ? "Active" : "No Lease",
      icon: FileText,
      description: lease
        ? `Expires ${format(new Date(lease.endDate || ""), "MMM yyyy")}`
        : "No active lease",
      variant: lease ? ("success" as const) : ("default" as const),
    },
    {
      title: "Next Payment",
      value: payments.nextPaymentDue
        ? format(new Date(payments.nextPaymentDue), "MMM dd")
        : "N/A",
      icon: DollarSign,
      description: lease
        ? `$${lease.rentAmount.toLocaleString()}`
        : "No active lease",
      variant: payments.pending > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      title: "Total Payments",
      value: payments.completed,
      icon: Calendar,
      description: payments.pending > 0 
        ? `${payments.pending} pending`
        : "All caught up",
      variant: "default" as const,
    },
    {
      title: "Open Tickets",
      value: maintenance.open,
      icon: Wrench,
      description: `${maintenance.completed} completed`,
      variant: maintenance.open > 0 ? ("warning" as const) : ("default" as const),
    },
  ];

  return <QuickStats stats={stats} />;
}

// ============================================================================
// Component: Upcoming Actions
// ============================================================================
async function UpcomingActions() {
  const result = await getUpcomingLeaseActions();

  if (!result.success || !result.data || result.data.length === 0) {
    return null;
  }

  const actions = result.data;

  return (
    <div className="space-y-3">
      {actions.map((action: any, index: number) => (
        <Alert
          key={index}
          variant={action.priority === "HIGH" ? "destructive" : "default"}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{action.title}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{action.description}</span>
            {action.actionUrl && (
              <Link href={action.actionUrl}>
                <Button
                  size="sm"
                  variant={action.priority === "HIGH" ? "default" : "outline"}
                >
                  Take Action
                </Button>
              </Link>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

// ============================================================================
// Component: Active Lease
// ============================================================================
async function ActiveLease() {
  const result = await getTenantDashboardStats();

  if (!result.success || !result.data?.lease) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Lease</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No active lease found</p>
            <Link href="/dashboard/applications/new">
              <Button>Apply for Property</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { lease } = result.data;

  // Calculate days until lease ends
  const today = new Date();
  const endDate = new Date(lease.endDate || "");
  const daysUntilEnd = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Lease</CardTitle>
          <Badge
            variant={
              daysUntilEnd <= 30
                ? "destructive"
                : daysUntilEnd <= 90
                ? "secondary"
                : "default"
            }
          >
            {daysUntilEnd > 0 ? `${daysUntilEnd} days left` : "Expired"}
          </Badge>
        </div>
        <CardDescription>
          {lease.property.address}, {lease.property.city}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Property</p>
            <p className="font-medium text-lg">{lease.property.name}</p>
            <p className="text-sm text-muted-foreground">
              Unit {lease.unit.unitNumber} • {lease.unit.bedrooms} bed,{" "}
              {lease.unit.bathrooms} bath
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="text-xl font-bold">
                ${lease.rentAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Due on the {lease.rentDueDay}
                {lease.rentDueDay === 1
                  ? "st"
                  : lease.rentDueDay === 2
                  ? "nd"
                  : lease.rentDueDay === 3
                  ? "rd"
                  : "th"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lease End</p>
              <p className="text-xl font-bold">
                {format(new Date(lease.endDate || ""), "MMM dd, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                Started {format(new Date(lease.startDate), "MMM yyyy")}
              </p>
            </div>
          </div>

          {lease.deposit > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Security Deposit</p>
              <p className="text-lg font-semibold">
                ${lease.deposit.toLocaleString()}
              </p>
            </div>
          )}

          <Link href="/dashboard/my-lease">
            <Button className="w-full">View Full Lease Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Component: Recent Payments
// ============================================================================
async function RecentPayments() {
  const result = await getTenantRecentPayments(5);

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Failed to load payments
          </p>
        </CardContent>
      </Card>
    );
  }

  const payments = result.data;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    return type.replace(/_/g, " ");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your payment history</CardDescription>
          </div>
          <Link href="/dashboard/payments">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      ${payment.amount.toLocaleString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {getPaymentTypeLabel(payment.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {payment.property?.name || "Unknown Property"}
                  </p>
                  {payment.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(payment.dueDate), "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={getStatusVariant(payment.status)}>
                    {payment.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {payment.paidAt
                      ? format(new Date(payment.paidAt), "MMM dd")
                      : format(new Date(payment.createdAt), "MMM dd")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No payments yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Component: Maintenance Requests
// ============================================================================
async function MaintenanceRequests() {
  const result = await getTenantMaintenanceRequests(5);

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Failed to load maintenance requests
          </p>
        </CardContent>
      </Card>
    );
  }

  const tickets = result.data;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "OPEN":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600";
      case "HIGH":
        return "text-orange-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Maintenance Requests</CardTitle>
            <CardDescription>Track your service requests</CardDescription>
          </div>
          <Link href="/dashboard/maintenance/new">
            <Button size="sm">New Request</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <div
                key={ticket.id}
                className="flex items-start justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{ticket.title}</p>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(ticket.priority)}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ticket.property.name}
                    {ticket.location && ` • ${ticket.location}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.category}
                  </p>
                  {ticket.scheduledDate && (
                    <p className="text-xs text-muted-foreground">
                      Scheduled:{" "}
                      {format(new Date(ticket.scheduledDate), "MMM dd, h:mm a")}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4 space-y-1">
                  <Badge variant={getStatusVariant(ticket.status)}>
                    {ticket.status.replace(/_/g, " ")}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(ticket.createdAt), "MMM dd")}
                  </p>
                </div>
              </div>
            ))}
            <Link href="/dashboard/maintenance">
              <Button variant="outline" className="w-full">
                View All Requests
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">No maintenance requests</p>
            <Link href="/dashboard/maintenance/new">
              <Button variant="outline">Create First Request</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Loading Components
// ============================================================================
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