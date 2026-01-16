/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// FILE 3: components/lease/lease-signing-form.tsx
// ============================================================================
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Users, 
  Home, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Pen,
} from "lucide-react";
import { format } from "date-fns";
import { signLeaseAgreement } from "@/actions/lease-signing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import Image from "next/image";

interface LeaseSigningFormProps {
  leaseData: any;
}

export function LeaseSigningForm({ leaseData }: LeaseSigningFormProps) {
  const router = useRouter();
  const { lease, signingStatus } = leaseData;
  const property = lease.unit.property;
  const unit = lease.unit;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [acknowledgedResponsibilities, setAcknowledgedResponsibilities] = useState(false);
  
  const signatureRef = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    setTypedSignature("");
  };

  const handleSign = async () => {
    // Validation
    if (!agreedToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    if (!acknowledgedResponsibilities) {
      toast.error("You must acknowledge your responsibilities");
      return;
    }

    let signatureData = "";

    if (signatureType === "draw") {
      if (signatureRef.current?.isEmpty()) {
        toast.error("Please provide your signature");
        return;
      }
      signatureData = signatureRef.current!.toDataURL();
    } else {
      if (!typedSignature.trim()) {
        toast.error("Please type your full name");
        return;
      }
      signatureData = `TYPED:${typedSignature}`;
    }

    setIsSubmitting(true);

    const result = await signLeaseAgreement(
      lease.id,
      signatureData
    );

    if (result.success) {
      toast.success(result.message);
      setShowSignatureDialog(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sign Lease Agreement</h1>
        <p className="text-muted-foreground">
          Review and sign your lease agreement
        </p>
      </div>

      {/* Signing Status */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Signing Status</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {signingStatus.signedTenants} of {signingStatus.totalTenants} tenants signed
                </span>
                <span>•</span>
                <span>
                  {signingStatus.landlordSigned 
                    ? "Landlord signed" 
                    : "Waiting for landlord"}
                </span>
              </div>
            </div>
            <Badge variant={signingStatus.currentUserSigned ? "default" : "secondary"}>
              {signingStatus.currentUserSigned ? "You signed" : "Pending"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lease Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Home className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="terms">
            <FileText className="h-4 w-4 mr-2" />
            Terms
          </TabsTrigger>
          <TabsTrigger value="tenants">
            <Users className="h-4 w-4 mr-2" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="property">
            <Home className="h-4 w-4 mr-2" />
            Property
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lease Overview</CardTitle>
              <CardDescription>Key information about your lease</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Image */}
              {property.images[0] && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <Image
                    src={property.images[0].url}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Key Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Property</Label>
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.address}, {property.city}, {property.state}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Unit</Label>
                    <p className="font-medium">Unit {unit.unitNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {unit.bedrooms} bed • {unit.bathrooms} bath
                      {unit.squareFeet && ` • ${unit.squareFeet} sq ft`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Rent</p>
                        <p className="text-2xl font-bold">
                          ${lease.rentAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Start Date</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(lease.startDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">End Date</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {lease.endDate 
                          ? format(new Date(lease.endDate), "MMM d, yyyy")
                          : "Month-to-Month"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Security Deposit</Label>
                  <p className="font-medium">${lease.deposit.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rent Due Date</Label>
                  <p className="font-medium">
                    {lease.rentDueDay}
                    {lease.rentDueDay === 1 ? "st" : lease.rentDueDay === 2 ? "nd" : lease.rentDueDay === 3 ? "rd" : "th"} of each month
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lease Type</Label>
                  <p className="font-medium">{lease.type.replace("_", " ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lease Terms & Conditions</CardTitle>
              <CardDescription>
                Please read carefully before signing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lease.terms ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: lease.terms }}
                />
              ) : (
                <div className="space-y-4 text-sm">
                  <p>This lease agreement is entered into between:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Landlord:</strong> {property.landlord.user.name}
                    </li>
                    <li>
                      <strong>Tenant(s):</strong> {lease.tenants.map((t: any) => t.tenant.user.name).join(", ")}
                    </li>
                    <li>
                      <strong>Property:</strong> {property.address}, Unit {unit.unitNumber}
                    </li>
                  </ul>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">1. Rent Payment</h4>
                    <p>
                      Tenant agrees to pay ${lease.rentAmount} per month, due on the{" "}
                      {lease.rentDueDay}
                      {lease.rentDueDay === 1 ? "st" : lease.rentDueDay === 2 ? "nd" : lease.rentDueDay === 3 ? "rd" : "th"} day of each month.
                    </p>
                    {lease.lateFeeAmount && (
                      <p className="mt-2">
                        Late Fee: ${lease.lateFeeAmount} will be charged after{" "}
                        {lease.lateFeeDays} days past due date.
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Security Deposit</h4>
                    <p>
                      A security deposit of ${lease.deposit} has been paid and will be held for the duration of the lease.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Lease Term</h4>
                    <p>
                      This lease begins on {format(new Date(lease.startDate), "MMMM d, yyyy")}
                      {lease.endDate && ` and ends on ${format(new Date(lease.endDate), "MMMM d, yyyy")}`}.
                    </p>
                  </div>

                  {property.policies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">4. Property Policies</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {property.policies.map((policy: any) => (
                          <li key={policy.id}>{policy.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Co-Tenants</CardTitle>
              <CardDescription>
                All parties responsible for this lease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lease.tenants.map((leaseTenant: any) => (
                  <div
                    key={leaseTenant.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {leaseTenant.tenant.user.name}
                          {leaseTenant.isPrimaryTenant && (
                            <Badge variant="outline" className="ml-2">
                              Primary
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {leaseTenant.tenant.user.email}
                        </p>
                      </div>
                    </div>
                    {leaseTenant.signedAt ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Signed</span>
                      </div>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Tab */}
        <TabsContent value="property" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                {unit.description ? (
                  <p className="mt-1">{unit.description}</p>
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {unit.bedrooms} bedroom, {unit.bathrooms} bathroom unit
                  </p>
                )}
              </div>

              {unit.amenities.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {unit.amenities.map((ua: any) => (
                      <div key={ua.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{ua.amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unit.parkingSpaces.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Parking</Label>
                  <div className="mt-2 space-y-2">
                    {unit.parkingSpaces.map((space: any) => (
                      <div key={space.id} className="flex justify-between text-sm">
                        <span>Space {space.spaceNumber} - {space.type}</span>
                        {space.monthlyFee && (
                          <span className="font-medium">${space.monthlyFee}/mo</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sign Button */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              I have read and agree to the terms and conditions of this lease agreement
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="responsibilities"
              checked={acknowledgedResponsibilities}
              onCheckedChange={(checked) => setAcknowledgedResponsibilities(checked as boolean)}
            />
            <Label htmlFor="responsibilities" className="text-sm cursor-pointer">
              I acknowledge my responsibilities as a tenant and agree to comply with all property rules and policies
            </Label>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => setShowSignatureDialog(true)}
            disabled={!agreedToTerms || !acknowledgedResponsibilities}
          >
            <Pen className="h-5 w-5 mr-2" />
            Sign Lease Agreement
          </Button>
        </CardContent>
      </Card>

      {/* Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Sign Lease Agreement</DialogTitle>
            <DialogDescription>
              Please provide your signature below
            </DialogDescription>
          </DialogHeader>

          <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as "draw" | "type")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw">Draw Signature</TabsTrigger>
              <TabsTrigger value="type">Type Signature</TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: "w-full h-40 bg-white rounded",
                  }}
                />
              </div>
              <Button variant="outline" onClick={clearSignature} className="w-full">
                Clear Signature
              </Button>
            </TabsContent>

            <TabsContent value="type" className="space-y-4">
              <div>
                <Label htmlFor="typed-signature">Full Legal Name</Label>
                <Input
                  id="typed-signature"
                  placeholder="Type your full name"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  className="mt-2 text-2xl font-script"
                />
              </div>
              {typedSignature && (
                <div className="p-4 border rounded-lg bg-muted">
                  <p className="text-3xl font-script text-center">{typedSignature}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              By signing, you agree to be legally bound by this lease agreement.
              This constitutes an electronic signature with the same legal effect
              as a handwritten signature.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSignatureDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSign} disabled={isSubmitting}>
              {isSubmitting ? "Signing..." : "Confirm & Sign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}