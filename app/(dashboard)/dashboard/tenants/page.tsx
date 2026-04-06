/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/(landlord)/tenants/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTenants } from "@/actions/tenants";
import { TenantsList } from "@/components/tenants/tenants-list";
import { TenantsCardView } from "@/components/tenants/tenants-card-view";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { ViewToggle } from "@/components/tenants/view-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Users } from "lucide-react";

export const metadata = {
  title: "Tenants | Property Management",
  description: "Manage your tenants",
};

interface TenantsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const view = typeof params.view === "string" ? params.view : "overview";

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <Typography variant="h2" className="mb-1">Tenants</Typography>
    <Typography variant="muted">Manage tenant information, leases, and payments</Typography>
  </div>
  <ViewToggle currentView={view} />
</div>

{/* Single content area — controlled by the toggle */}
<Suspense fallback={<TenantsLoading view={view} />}>
  <TenantsListWrapper
    search={search}
    status={status}
    page={page}
    view={view}
  />
</Suspense>
      </Stack>
    </Container>
  );
}

// ============================================================================
// Payment Overview Table
// ============================================================================
async function TenantPaymentOverview() {
  const result = await getTenants({ limit: 50 });
  if (!result.success) return null;

  const tenants = result.data.tenants;
  const today = new Date();

  const activeTenants = tenants.filter(
    (t: any) => t.leaseMembers?.length > 0
  );

  // AFTER
if (activeTenants.length === 0) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Overview</CardTitle>
        <CardDescription>Next scheduled payment for each active tenant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-5">
            <Users className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No active tenants</p>
          <p className="text-xs text-muted-foreground/60 max-w-55">
            Tenants with an active lease will appear here with their payment schedule.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

  // Sort: overdue first, then due soonest
  const sorted = [...activeTenants].sort((a: any, b: any) => {
    const aDate = a.nextPayment?.dueDate ? new Date(a.nextPayment.dueDate).getTime() : Infinity;
    const bDate = b.nextPayment?.dueDate ? new Date(b.nextPayment.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });

  const overdueCount = sorted.filter((t: any) => {
    if (!t.nextPayment?.dueDate) return false;
    return new Date(t.nextPayment.dueDate) < today;
  }).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Overview</CardTitle>
            <CardDescription>
              Next scheduled payment for each active tenant
            </CardDescription>
          </div>
          {overdueCount > 0 && (
            <Badge variant="destructive">
              {overdueCount} overdue
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-5 gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Tenant</span>
            <span>Property / Unit</span>
            <span>Monthly Rent</span>
            <span>Next Payment</span>
            <span>Status</span>
          </div>

          {sorted.map((tenant: any) => {
            const lease = tenant.leaseMembers[0]?.lease;
            const next = tenant.nextPayment;
            const daysUntil = next?.dueDate
              ? Math.ceil(
                  (new Date(next.dueDate).getTime() - today.getTime()) / 86400000
                )
              : null;

            const isOverdue = daysUntil !== null && daysUntil < 0;
            const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 5;

            return (
              <div
                key={tenant.id}
                className={`grid grid-cols-5 gap-4 px-6 py-4 border-b last:border-0 items-center hover:bg-muted/30 transition-colors ${
                  isOverdue ? "bg-red-50/50 dark:bg-red-950/10" : ""
                }`}
              >
                {/* Tenant */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={tenant.user.avatar || tenant.user.image} />
                    <AvatarFallback className="text-xs">
                      {tenant.user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tenant.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tenant.user.email}
                    </p>
                  </div>
                </div>

                {/* Property */}
                <div>
                  <p className="text-sm font-medium truncate">
                    {lease?.unit?.property?.name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unit {lease?.unit?.unitNumber}
                  </p>
                </div>

                {/* Rent amount */}
                <p className="text-sm font-medium">
                  ${Number(lease?.rentAmount || 0).toLocaleString()}/mo
                </p>

                {/* Next payment */}
                <div>
                  {next ? (
                    <>
                      <p className={`text-sm font-medium ${isOverdue ? "text-destructive" : ""}`}>
                        ${Number(next.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(next.dueDate), "MMM dd, yyyy")}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No upcoming</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  {isOverdue ? (
                    <Badge variant="destructive">
                      {Math.abs(daysUntil!)} day{Math.abs(daysUntil!) !== 1 ? "s" : ""} overdue
                    </Badge>
                  ) : isDueSoon ? (
                    <Badge variant="secondary">
                      Due in {daysUntil} day{daysUntil !== 1 ? "s" : ""}
                    </Badge>
                  ) : daysUntil !== null ? (
                    <Badge variant="outline">
                      {daysUntil} days
                    </Badge>
                  ) : (
                    <Badge variant="outline">No payments</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {sorted.map((tenant: any) => {
            const lease = tenant.leaseMembers[0]?.lease;
            const next = tenant.nextPayment;
            const daysUntil = next?.dueDate
              ? Math.ceil(
                  (new Date(next.dueDate).getTime() - today.getTime()) / 86400000
                )
              : null;
            const isOverdue = daysUntil !== null && daysUntil < 0;

            return (
              <div
                key={tenant.id}
                className={`p-4 space-y-3 ${isOverdue ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={tenant.user.avatar || tenant.user.image} />
                      <AvatarFallback className="text-xs">
                        {tenant.user.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{tenant.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lease?.unit?.property?.name} · Unit {lease?.unit?.unitNumber}
                      </p>
                    </div>
                  </div>
                  {isOverdue ? (
                    <Badge variant="destructive">
                      {Math.abs(daysUntil!)}d overdue
                    </Badge>
                  ) : daysUntil !== null ? (
                    <Badge variant={daysUntil <= 5 ? "secondary" : "outline"}>
                      {daysUntil}d
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly rent</span>
                  <span className="font-medium">
                    ${Number(lease?.rentAmount || 0).toLocaleString()}/mo
                  </span>
                </div>

                {next && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next payment</span>
                    <span className={`font-medium ${isOverdue ? "text-destructive" : ""}`}>
                      ${Number(next.amount).toLocaleString()} · {format(new Date(next.dueDate), "MMM dd")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Tenants List Wrapper
// ============================================================================
async function TenantsListWrapper({
  search,
  status,
  page,
  view,
}: {
  search: string;
  status: string;
  page: number;
  view: string;
}) {
  if (view === "overview") {
    return <TenantPaymentOverview />;
  }

  const result = await getTenants({
    search,
    leaseStatus: status !== "all" ? status : undefined,
    page,
    limit: 10,
  });

  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{result.error}</p>
      </div>
    );
  }

  return view === "card" ? (
    <TenantsCardView initialData={result.data} />
  ) : (
    <TenantsList initialData={result.data} />
  );
}

// ============================================================================
// Loading
// ============================================================================
function TenantsLoading({ view }: { view: string }) {
  if (view === "card") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-80 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}