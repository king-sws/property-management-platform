/* eslint-disable @typescript-eslint/no-explicit-any */
// components/leases/lease-details.tsx
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Home,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { terminateLease } from "@/actions/leases";
import { toast } from "sonner";
// ✅ ADD THIS IMPORT
import { LeaseSignatureStatus } from "@/components/leases/lease-signature-status";

interface LeaseDetailsProps {
  lease: any;
  statistics: any;
  isLandlord?: boolean; // ✅ ADD THIS PROP
}

export function LeaseDetails({ lease, statistics, isLandlord = true }: LeaseDetailsProps) {
  const router = useRouter();
  const [isTerminating, setIsTerminating] = useState(false);
  const [terminationDate, setTerminationDate] = useState("");
  const [terminationReason, setTerminationReason] = useState("");

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
      case "PENDING_SIGNATURE":
        return "secondary";
      case "DRAFT":
        return "outline";
      case "EXPIRED":
        return "secondary";
      case "TERMINATED":
        return "destructive";
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

  const handleTerminateLease = async () => {
    if (!terminationDate || !terminationReason) {
      toast.error("Please provide termination date and reason");
      return;
    }

    setIsTerminating(true);
    const result = await terminateLease(lease.id, {
      terminationDate,
      reason: terminationReason,
    });

    if (result.success) {
      toast.success("Lease terminated successfully");
      router.refresh();
      setTerminationDate("");
      setTerminationReason("");
    } else {
      toast.error(result.error || "Failed to terminate lease");
    }
    setIsTerminating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Leases
        </Button>
        <div className="flex gap-2">
          {lease.status !== "TERMINATED" && lease.status !== "EXPIRED" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Ban className="mr-2 h-4 w-4" />
                  Terminate Lease
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Terminate Lease</DialogTitle>
                  <DialogDescription>
                    This will end the lease early. Please provide the termination
                    date and reason.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="terminationDate">Termination Date</Label>
                    <Input
                      id="terminationDate"
                      type="date"
                      value={terminationDate}
                      onChange={(e) => setTerminationDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Explain why the lease is being terminated..."
                      value={terminationReason}
                      onChange={(e) => setTerminationReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleTerminateLease}
                    disabled={isTerminating}
                  >
                    {isTerminating ? "Terminating..." : "Terminate Lease"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {lease.status !== "TERMINATED" && (
            <Button
              onClick={() => router.push(`/dashboard/leases/${lease.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Lease
            </Button>
          )}
        </div>
      </div>

      {/* Lease Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Home className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {lease.unit.property.name}
                    </h2>
                    <p className="text-muted-foreground">
                      Unit {lease.unit.unitNumber}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {lease.unit.property.address}, {lease.unit.property.city},{" "}
                  {lease.unit.property.state}
                </p>
              </div>
              <Badge variant={getLeaseStatusColor(lease.status) as any}>
                {lease.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lease Type
                </p>
                <p className="text-sm font-semibold">
                  {lease.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Date
                </p>
                <p className="text-sm font-semibold">
                  {format(new Date(lease.startDate), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  End Date
                </p>
                <p className="text-sm font-semibold">
                  {lease.endDate
                    ? format(new Date(lease.endDate), "MMM d, yyyy")
                    : "Month-to-month"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Rent
                </p>
                <p className="text-sm font-semibold">
                  ${Number(lease.rentAmount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ ADD SIGNATURE STATUS HERE - Shows if lease needs signatures */}
      {(lease.status === "PENDING_SIGNATURE" || lease.status === "DRAFT") && (
        <LeaseSignatureStatus lease={lease} isLandlord={isLandlord} />
      )}

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
                {statistics.onTimePayments} on-time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Days Remaining
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.daysRemaining !== null
                  ? statistics.daysRemaining > 0
                    ? statistics.daysRemaining
                    : "Expired"
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.daysRemaining !== null && statistics.daysRemaining > 0
                  ? "until lease ends"
                  : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.activeViolations}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.totalViolations} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lease Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Security Deposit
                  </p>
                  <p className="text-sm font-semibold">
                    ${Number(lease.deposit).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rent Due Day
                  </p>
                  <p className="text-sm font-semibold">
                    Day {lease.rentDueDay} of each month
                  </p>
                </div>
                {lease.lateFeeAmount && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Late Fee
                      </p>
                      <p className="text-sm font-semibold">
                        ${Number(lease.lateFeeAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Late Fee Grace Period
                      </p>
                      <p className="text-sm font-semibold">
                        {lease.lateFeeDays} days
                      </p>
                    </div>
                  </>
                )}
              </div>

              {lease.terms && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Additional Terms
                  </p>
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-sm whitespace-pre-wrap">{lease.terms}</p>
                  </div>
                </div>
              )}

              {lease.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Notes
                  </p>
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-sm whitespace-pre-wrap">{lease.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Landlord Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{lease.unit.property.landlord.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {lease.unit.property.landlord.user.email}
                </p>
                {lease.unit.property.landlord.user.phone && (
                  <p className="text-sm text-muted-foreground">
                    {lease.unit.property.landlord.user.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-4">
          {lease.tenants.map((leaseTenant: any) => (
            <Card key={leaseTenant.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        leaseTenant.tenant.user.avatar ||
                        leaseTenant.tenant.user.image
                      }
                      alt={leaseTenant.tenant.user.name || ""}
                    />
                    <AvatarFallback>
                      {getInitials(leaseTenant.tenant.user.name || "TN")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        {leaseTenant.tenant.user.name}
                      </h3>
                      {leaseTenant.isPrimaryTenant && (
                        <Badge variant="outline">Primary Tenant</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{leaseTenant.tenant.user.email}</p>
                      {leaseTenant.tenant.user.phone && (
                        <p>{leaseTenant.tenant.user.phone}</p>
                      )}
                    </div>
                    {leaseTenant.signedAt && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Signed on{" "}
                        {format(new Date(leaseTenant.signedAt), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/dashboard/tenants/${leaseTenant.tenant.id}`
                      )
                    }
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {lease.payments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payments</h3>
                <p className="text-sm text-muted-foreground">
                  No payment history available for this lease
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lease.payments.map((payment: any) => (
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
                          <p className="text-xs text-muted-foreground">
                            {payment.paidAt
                              ? format(
                                  new Date(payment.paidAt),
                                  "MMM d, yyyy 'at' h:mm a"
                                )
                              : payment.dueDate
                              ? `Due ${format(new Date(payment.dueDate), "MMM d, yyyy")}`
                              : format(
                                  new Date(payment.createdAt),
                                  "MMM d, yyyy"
                                )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${Number(payment.amount).toLocaleString()}
                        </p>
                        <Badge
                          variant={getPaymentStatusColor(payment.status) as any}
                          className="mt-1"
                        >
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

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          {lease.violations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Violations</h3>
                <p className="text-sm text-muted-foreground">
                  This lease has no recorded violations
                </p>
              </CardContent>
            </Card>
          ) : (
            lease.violations.map((violation: any) => (
              <Card key={violation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{violation.type}</CardTitle>
                    <Badge
                      variant={violation.isResolved ? "default" : "destructive"}
                    >
                      {violation.isResolved ? "Resolved" : "Active"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Issued on {format(new Date(violation.issuedDate), "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{violation.description}</p>
                  {violation.actionTaken && (
                    <div className="rounded-md bg-muted p-3">
                      <p className="text-xs font-medium mb-1">Action Taken:</p>
                      <p className="text-sm">{violation.actionTaken}</p>
                    </div>
                  )}
                  {violation.resolvedDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resolved on{" "}
                      {format(new Date(violation.resolvedDate), "MMM d, yyyy")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}