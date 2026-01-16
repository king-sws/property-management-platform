/* eslint-disable @typescript-eslint/no-explicit-any */
// components/lease-signing/lease-signing-view.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { signLease } from "@/actions/lease-signing";
import { toast } from "sonner";
import { SignatureCanvas } from "./signature-canvas";
import Image from "next/image";

interface LeaseSigningViewProps {
  lease: any;
}

export function LeaseSigningView({ lease }: LeaseSigningViewProps) {
  const router = useRouter();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const property = lease.unit.property;
  const unit = lease.unit;
  const primaryImage = property.images?.[0]?.url || "/placeholder-property.jpg";

  const handleSign = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!signature) {
      toast.error("Please provide your signature");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signLease(lease.id, {
        signature,
        agreedToTerms,
        ipAddress: undefined, // Could be fetched client-side if needed
        userAgent: navigator.userAgent,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        
        // Redirect based on whether lease is fully signed
        if (result.data?.status === "ACTIVE") {
          router.push("/dashboard/my-lease");
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Signing error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lease Agreement - Signature Required</h1>
        <p className="text-muted-foreground mt-2">
          Please review the lease terms and sign below to continue
        </p>
      </div>

      {/* Signing Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Signing Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {lease.signingProgress.totalSigned} of {lease.signingProgress.totalNeeded} signatures completed
                </p>
              </div>
              <Badge variant={lease.signingProgress.isFullySigned ? "default" : "secondary"}>
                {lease.signingProgress.percentage}% Complete
              </Badge>
            </div>
            <Progress value={lease.signingProgress.percentage} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {lease.signingProgress.landlordSigned ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <div>
                  <div className="font-medium">Landlord</div>
                  <div className="text-sm text-muted-foreground">
                    {lease.signingProgress.landlordSigned ? "Signed" : "Pending"}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {lease.signingProgress.tenantsSignedCount === lease.tenants.length ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <div>
                  <div className="font-medium">Tenants</div>
                  <div className="text-sm text-muted-foreground">
                    {lease.signingProgress.tenantsSignedCount} of {lease.tenants.length} signed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property & Lease Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src={primaryImage}
                alt={property.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{property.name}</h2>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}, {property.city}, {property.state}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Building2 className="h-4 w-4" />
                  <span>Unit {unit.unitNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Monthly Rent</div>
                  <div className="text-xl font-bold flex items-center">
                    <DollarSign className="h-5 w-5" />
                    {lease.rentAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Lease Start</div>
                  <div className="font-semibold flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(lease.startDate), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Lease End</div>
                  <div className="font-semibold">
                    {lease.endDate
                      ? format(new Date(lease.endDate), "MMM d, yyyy")
                      : "Month-to-Month"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Lease Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Financial Terms</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent:</span>
                  <span className="font-medium">${lease.rentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit:</span>
                  <span className="font-medium">${lease.deposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rent Due Day:</span>
                  <span className="font-medium">
                    {lease.rentDueDay}
                    {lease.rentDueDay === 1 ? "st" : lease.rentDueDay === 2 ? "nd" : lease.rentDueDay === 3 ? "rd" : "th"} of each month
                  </span>
                </div>
                {lease.lateFeeAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Late Fee:</span>
                    <span className="font-medium">
                      ${lease.lateFeeAmount} after {lease.lateFeeDays} days
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Lease Period</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lease Type:</span>
                  <span className="font-medium">{lease.type.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">
                    {format(new Date(lease.startDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">
                    {lease.endDate
                      ? format(new Date(lease.endDate), "MMMM d, yyyy")
                      : "Month-to-Month"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tenants */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Tenants on Lease
            </h3>
            <div className="space-y-2">
              {lease.tenants.map((leaseTenant: any) => (
                <div
                  key={leaseTenant.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{leaseTenant.tenant.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {leaseTenant.tenant.user.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {leaseTenant.isPrimaryTenant && (
                      <Badge variant="outline">Primary</Badge>
                    )}
                    {leaseTenant.signedAt ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Signed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {lease.terms && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Additional Terms</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {lease.terms}
                  </pre>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              By signing below, you acknowledge that you have read, understood, and agree to all
              terms and conditions of this lease agreement.
            </AlertDescription>
          </Alert>

          <SignatureCanvas onSignatureChange={setSignature} />

          <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <div className="space-y-1 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </label>
              <p className="text-sm text-muted-foreground">
                I have read and agree to all terms, conditions, and policies outlined in this
                lease agreement. I understand that this is a legally binding document.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={!agreedToTerms || !signature || isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Sign Lease Agreement
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}