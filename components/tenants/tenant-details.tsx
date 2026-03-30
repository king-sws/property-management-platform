/* eslint-disable @typescript-eslint/no-explicit-any */
// components/tenants/tenant-details.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Home,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { resendWelcomeEmail } from "@/actions/tenants";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TenantDetailsProps {
  tenant: any;
  statistics: any;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const leaseStatusStyle: Record<string, string> = {
  ACTIVE:        "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  EXPIRING_SOON: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  EXPIRED:       "bg-muted text-muted-foreground",
  TERMINATED:    "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const paymentStatusStyle: Record<string, string> = {
  COMPLETED: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  PENDING:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  FAILED:    "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const appStatusStyle: Record<string, string> = {
  APPROVED:             "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CONDITIONALLY_APPROVED: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  DENIED:               "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  SUBMITTED:            "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  UNDER_REVIEW:         "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
};

export function TenantDetails({ tenant, statistics }: TenantDetailsProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const result = await resendWelcomeEmail(tenant.id);
      if (result.success) toast.success(result.message || "Welcome email sent");
      else toast.error(result.error || "Failed to send email");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsResending(false);
    }
  };

  const activeLease = tenant.leaseMembers?.[0]?.lease;
  const name = tenant.user.name || "Tenant";

  return (
    <div className="space-y-6">

      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to tenants
        </button>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Resend credentials
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resend login credentials?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new temporary password and send it to{" "}
                  <strong>{tenant.user.email}</strong>. The current password will be replaced.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResendEmail} disabled={isResending}>
                  {isResending ? (
                    <><RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />Sending...</>
                  ) : "Send email"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button size="sm" onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}>
            <Edit className="mr-2 h-3.5 w-3.5" />
            Edit tenant
          </Button>
        </div>
      </div>

<div className="bg-card border rounded-xl p-6">
  <div className="flex items-start justify-between gap-6">
    
    {/* Left side */}
    <div className="flex items-start gap-4">
      
      {/* Avatar */}
      <div className="relative shrink-0">
        {tenant.user.avatar || tenant.user.image ? (
          <img
            src={tenant.user.avatar || tenant.user.image}
            alt={name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-lg font-medium text-blue-700 dark:text-blue-300 ring-2 ring-border">
            {initials(name)}
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h2 className="text-xl font-semibold">{name}</h2>

          {/* User status */}
          {/* Tenant account status */}
<span
  className={`text-xs font-medium px-2 py-1 rounded-full ${
    tenant.user.status === "ACTIVE"
      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
      : "bg-muted text-muted-foreground"
  }`}
>
  Account {tenant.user.status.toLowerCase()}
</span>

{/* Lease status */}
{activeLease && (
  <span
    className={`text-xs font-medium px-2 py-1 rounded-full ${
      leaseStatusStyle[activeLease.status] ??
      "bg-muted text-muted-foreground"
    }`}
  >
    Lease {activeLease.status.replace("_", " ").toLowerCase()}
  </span>
)}
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Tenant ID · {tenant.id.slice(0, 8)}
        </p>

        {/* Contact info */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {tenant.user.email}
          </span>

          {tenant.user.phone && (
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {tenant.user.phone}
            </span>
          )}

          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Member since {format(new Date(tenant.createdAt), "MMM yyyy")}
          </span>

        </div>
      </div>
    </div>

    

  </div>
</div>

      {/* Stats */}
{statistics && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      {
        icon: DollarSign,
        label: "Total paid",
        value: `$${statistics.totalPaid.toLocaleString()}`,
        sub: `${statistics.totalPayments} payments`,
        color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
      },
      {
        icon: TrendingUp,
        label: "Payment reliability",
        value: `${statistics.paymentReliability.toFixed(0)}%`,
        sub: `${statistics.onTimePayments} on-time`,
        color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
      },
      {
        icon: Home,
        label: "Active leases",
        value: statistics.activeLeases,
        sub: `${statistics.totalLeases} total`,
        color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30",
      },
      {
        icon: AlertCircle,
        label: "Late payments",
        value: statistics.latePayments,
        sub: `${
          statistics.totalPayments > 0
            ? ((statistics.latePayments / statistics.totalPayments) * 100).toFixed(0)
            : 0
        }% of total`,
        color: "text-red-500 bg-red-50 dark:bg-red-950/30",
      },
    ].map((stat) => (
      <div
        key={stat.label}
        className="bg-card border rounded-xl p-5 flex items-start justify-between hover:shadow-sm transition"
      >
        <div>
          <p className="text-sm text-muted-foreground">{stat.label}</p>

          <p className="text-2xl font-semibold mt-1">{stat.value}</p>

          <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
        </div>

        <div className={`p-2 rounded-lg ${stat.color}`}>
          <stat.icon className="w-5 h-5" />
        </div>
      </div>
    ))}
  </div>
)}

      {/* Tabs */}
      <Tabs defaultValue="leases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* ── Leases ── */}
        <TabsContent value="leases" className="space-y-3">
          {tenant.leaseMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-border rounded-xl text-center">
              <Home className="w-9 h-9 text-muted-foreground/40 mb-3" />
              <p className="font-medium mb-1">No leases</p>
              <p className="text-sm text-muted-foreground">This tenant has no lease history</p>
            </div>
          ) : (
            tenant.leaseMembers.map((lm: any) => (
              <div key={lm.id} className="bg-background border border-border/50 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{lm.lease.unit.property.name}</p>
                    <p className="text-sm text-muted-foreground">Unit {lm.lease.unit.unitNumber}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${leaseStatusStyle[lm.lease.status] ?? "bg-muted text-muted-foreground"}`}>
                    {lm.lease.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: "Start date", value: format(new Date(lm.lease.startDate), "MMM d, yyyy") },
                    { label: "End date", value: lm.lease.endDate ? format(new Date(lm.lease.endDate), "MMM d, yyyy") : "Month-to-month" },
                    { label: "Rent", value: `$${Number(lm.lease.rentAmount).toLocaleString()}/mo` },
                    { label: "Deposit", value: `$${Number(lm.lease.deposit).toLocaleString()}` },
                  ].map((row) => (
                    <div key={row.label}>
                      <p className="text-muted-foreground mb-0.5">{row.label}</p>
                      <p className="font-medium">{row.value}</p>
                    </div>
                  ))}
                </div>

                {lm.lease.tenants.length > 1 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Co-tenants</p>
                    <div className="flex flex-wrap gap-2">
                      {lm.lease.tenants
                        .filter((t: any) => t.tenantId !== tenant.id)
                        .map((t: any) => (
                          <span key={t.id} className="text-xs px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground">
                            {t.tenant.user.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/leases/${lm.lease.id}`)}
                >
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  View lease
                </Button>
              </div>
            ))
          )}
        </TabsContent>

        {/* ── Payments ── */}
        <TabsContent value="payments">
          {tenant.payments.filter((p: any) => p.status !== "CANCELLED").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-border rounded-xl text-center">
              <DollarSign className="w-9 h-9 text-muted-foreground/40 mb-3" />
              <p className="font-medium mb-1">No payments</p>
              <p className="text-sm text-muted-foreground">No payment history available</p>
            </div>
          ) : (
            <div className="bg-background border border-border/50 rounded-xl divide-y divide-border/50">
              {tenant.payments
                .filter((p: any) => p.status !== "CANCELLED")
                .map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="shrink-0 mt-0.5">
                        {payment.status === "COMPLETED" ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : payment.status === "PENDING" ? (
                          <Clock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{payment.type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.lease?.unit?.unitNumber
                            ? `Unit ${payment.lease.unit.unitNumber} · ${payment.lease.unit.property.name}`
                            : "General payment"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {payment.paidAt
                            ? format(new Date(payment.paidAt), "MMM d, yyyy 'at' h:mm a")
                            : payment.dueDate
                            ? `Due ${format(new Date(payment.dueDate), "MMM d, yyyy")}`
                            : format(new Date(payment.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">${Number(payment.amount).toLocaleString()}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${paymentStatusStyle[payment.status] ?? "bg-muted text-muted-foreground"}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>

        {/* ── Applications ── */}
        <TabsContent value="applications" className="space-y-3">
          {tenant.applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-border rounded-xl text-center">
              <FileText className="w-9 h-9 text-muted-foreground/40 mb-3" />
              <p className="font-medium mb-1">No applications</p>
              <p className="text-sm text-muted-foreground">No rental applications on file</p>
            </div>
          ) : (
            tenant.applications.map((app: any) => (
              <div key={app.id} className="bg-background border border-border/50 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-medium">{app.unit.property.name}</p>
                    <p className="text-sm text-muted-foreground">Unit {app.unit.unitNumber}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${appStatusStyle[app.status] ?? "bg-muted text-muted-foreground"}`}>
                    {app.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Submitted</p>
                    <p className="font-medium">
                      {app.submittedAt ? format(new Date(app.submittedAt), "MMM d, yyyy") : "Not submitted"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Desired move-in</p>
                    <p className="font-medium">{format(new Date(app.desiredMoveInDate), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* ── Details ── */}
        <TabsContent value="details" className="space-y-4">
          {/* Personal info */}
          <div className="bg-background border border-border/50 rounded-xl p-5">
            <p className="font-medium mb-4">Personal information</p>
            {[tenant.dateOfBirth, tenant.employerName, tenant.employerPhone, tenant.annualIncome].every((v) => !v) ? (
              <p className="text-sm text-muted-foreground">No personal information on file</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {tenant.dateOfBirth && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Date of birth</p>
                    <p className="font-medium">{format(new Date(tenant.dateOfBirth), "MMMM d, yyyy")}</p>
                  </div>
                )}
                {tenant.employerName && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Employer</p>
                    <p className="font-medium">{tenant.employerName}</p>
                  </div>
                )}
                {tenant.employerPhone && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Employer phone</p>
                    <p className="font-medium">{tenant.employerPhone}</p>
                  </div>
                )}
                {tenant.annualIncome && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Annual income</p>
                    <p className="font-medium">${Number(tenant.annualIncome).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emergency contact */}
          {(tenant.emergencyName || tenant.emergencyPhone) && (
            <div className="bg-background border border-border/50 rounded-xl p-5">
              <p className="font-medium mb-4">Emergency contact</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {tenant.emergencyName && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Name</p>
                    <p className="font-medium">{tenant.emergencyName}</p>
                  </div>
                )}
                {tenant.emergencyPhone && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Phone</p>
                    <p className="font-medium">{tenant.emergencyPhone}</p>
                  </div>
                )}
                {tenant.emergencyRelation && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Relationship</p>
                    <p className="font-medium">{tenant.emergencyRelation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}