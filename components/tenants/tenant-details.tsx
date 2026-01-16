/* eslint-disable @typescript-eslint/no-explicit-any */
// components/tenants/tenant-details.tsx - UPDATED WITH RESEND EMAIL
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function TenantDetails({ tenant, statistics }: TenantDetailsProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLeaseStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "EXPIRING_SOON":
        return "destructive";
      case "EXPIRED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPaymentStatusColor = (status: string) => {
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

  // ✅ NEW: Handle resend welcome email
  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const result = await resendWelcomeEmail(tenant.id);
      
      if (result.success) {
        toast.success(result.message || "Welcome email sent successfully");
      } else {
        toast.error(result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Resend email error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Button>
        <div className="flex gap-2">
          {/* ✅ NEW: Resend Welcome Email Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Credentials
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resend Login Credentials?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new temporary password and send it to{" "}
                  <strong>{tenant.user.email}</strong>. The tenant&apos;s current password 
                  will be replaced, and they&apos;ll need to use the new credentials to log in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Email"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Tenant
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={tenant.user.avatar || tenant.user.image}
                alt={tenant.user.name || ""}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(tenant.user.name || "TN")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{tenant.user.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Tenant ID: {tenant.id.slice(0, 8)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{tenant.user.email}</span>
                </div>
                {tenant.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{tenant.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Member since {format(new Date(tenant.createdAt), "MMM yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={tenant.user.status === "ACTIVE" ? "default" : "secondary"}>
                  {tenant.user.status}
                </Badge>
                {tenant.leaseMembers?.[0] && (
                  <Badge variant={getLeaseStatusColor(tenant.leaseMembers[0].lease.status) as any}>
                    {tenant.leaseMembers[0].lease.status.replace("_", " ")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statistics.totalPaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.totalPayments} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Payment Reliability
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.paymentReliability.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.onTimePayments} on-time payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.activeLeases}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.totalLeases} total leases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.latePayments}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.totalPayments > 0
                  ? ((statistics.latePayments / statistics.totalPayments) * 100).toFixed(0)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>
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

        {/* Leases Tab */}
        <TabsContent value="leases" className="space-y-4">
          {tenant.leaseMembers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Leases</h3>
                <p className="text-sm text-muted-foreground">
                  This tenant has no lease history
                </p>
              </CardContent>
            </Card>
          ) : (
            tenant.leaseMembers.map((leaseMember: any) => (
              <Card key={leaseMember.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {leaseMember.lease.unit.property.name}
                      </CardTitle>
                      <CardDescription>
                        Unit {leaseMember.lease.unit.unitNumber}
                      </CardDescription>
                    </div>
                    <Badge variant={getLeaseStatusColor(leaseMember.lease.status) as any}>
                      {leaseMember.lease.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Start Date
                      </p>
                      <p className="text-sm">
                        {format(new Date(leaseMember.lease.startDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        End Date
                      </p>
                      <p className="text-sm">
                        {leaseMember.lease.endDate
                          ? format(new Date(leaseMember.lease.endDate), "MMM d, yyyy")
                          : "Month-to-month"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Rent Amount
                      </p>
                      <p className="text-sm font-semibold">
                        ${Number(leaseMember.lease.rentAmount).toLocaleString()}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Deposit
                      </p>
                      <p className="text-sm">
                        ${Number(leaseMember.lease.deposit).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {leaseMember.lease.tenants.length > 1 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Co-Tenants
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {leaseMember.lease.tenants
                          .filter((t: any) => t.tenantId !== tenant.id)
                          .map((t: any) => (
                            <Badge key={t.id} variant="outline">
                              {t.tenant.user.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/leases/${leaseMember.lease.id}`)
                    }
                  >
                    View Lease Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {tenant.payments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payments</h3>
                <p className="text-sm text-muted-foreground">
                  No payment history available
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Recent payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenant.payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {payment.status === "COMPLETED" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : payment.status === "PENDING" ? (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {payment.type.replace("_", " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.lease?.unit.unitNumber
                              ? `Unit ${payment.lease.unit.unitNumber} - ${payment.lease.unit.property.name}`
                              : "General Payment"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paidAt
                              ? format(new Date(payment.paidAt), "MMM d, yyyy 'at' h:mm a")
                              : payment.dueDate
                              ? `Due ${format(new Date(payment.dueDate), "MMM d, yyyy")}`
                              : format(new Date(payment.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${Number(payment.amount).toLocaleString()}
                        </p>
                        <Badge variant={getPaymentStatusColor(payment.status) as any} className="mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {tenant.applications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications</h3>
                <p className="text-sm text-muted-foreground">
                  No rental applications on file
                </p>
              </CardContent>
            </Card>
          ) : (
            tenant.applications.map((app: any) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{app.unit.property.name}</CardTitle>
                      <CardDescription>
                        Unit {app.unit.unitNumber}
                      </CardDescription>
                    </div>
                    <Badge>{app.status.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Submitted:</span>{" "}
                      {app.submittedAt
                        ? format(new Date(app.submittedAt), "MMM d, yyyy")
                        : "Not submitted"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Move-in Date:</span>{" "}
                      {format(new Date(app.desiredMoveInDate), "MMM d, yyyy")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenant.dateOfBirth && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="text-sm">
                      {format(new Date(tenant.dateOfBirth), "MMMM d, yyyy")}
                    </p>
                  </div>
                )}
                {tenant.employerName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Employer
                    </p>
                    <p className="text-sm">{tenant.employerName}</p>
                  </div>
                )}
                {tenant.employerPhone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Employer Phone
                    </p>
                    <p className="text-sm">{tenant.employerPhone}</p>
                  </div>
                )}
                {tenant.annualIncome && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Annual Income
                    </p>
                    <p className="text-sm">
                      ${Number(tenant.annualIncome).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {(tenant.emergencyName || tenant.emergencyPhone) && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenant.emergencyName && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Name
                      </p>
                      <p className="text-sm">{tenant.emergencyName}</p>
                    </div>
                  )}
                  {tenant.emergencyPhone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm">{tenant.emergencyPhone}</p>
                    </div>
                  )}
                  {tenant.emergencyRelation && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Relationship
                      </p>
                      <p className="text-sm">{tenant.emergencyRelation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}