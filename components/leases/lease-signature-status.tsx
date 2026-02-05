/* eslint-disable @typescript-eslint/no-explicit-any */
// components/leases/lease-signature-status.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileSignature,
  CheckCircle,
  Clock,
  Mail,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { resendSigningInvitation } from "@/actions/lease-signing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LeaseSignatureStatusProps {
  lease: any;
  isLandlord: boolean;
}

export function LeaseSignatureStatus({ lease, isLandlord }: LeaseSignatureStatusProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  // Only show for pending signature or draft leases
  if (lease.status !== "PENDING_SIGNATURE" && lease.status !== "DRAFT") {
    return null;
  }

  const totalSignaturesNeeded = lease.tenants.length + 1;
  const landlordSigned = !!lease.landlordSignedAt;
  const tenantsSigned = lease.tenants.filter((lt: any) => lt.signedAt).length;
  const totalSigned = (landlordSigned ? 1 : 0) + tenantsSigned;
  const signingProgress = Math.round((totalSigned / totalSignaturesNeeded) * 100);

  const handleResendInvitations = async () => {
    setIsSending(true);
    const result = await resendSigningInvitation(lease.id);
    
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSending(false);
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            Signature Status
          </CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
            {totalSigned} of {totalSignaturesNeeded} Signed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{signingProgress}%</span>
          </div>
          <Progress value={signingProgress} className="h-2" />
        </div>

        {/* Landlord Signature */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Landlord</h4>
          <div className="flex items-center justify-between p-3 bg-white border rounded-lg dark:bg-card dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={lease.unit.property.landlord.user.avatar} />
                <AvatarFallback>
                  {lease.unit.property.landlord.user.name?.[0] || "L"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {lease.unit.property.landlord.user.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {lease.unit.property.landlord.user.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {landlordSigned ? (
                <>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Signed
                  </Badge>
                  {lease.landlordSignedAt && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(lease.landlordSignedAt), "MMM d")}
                    </span>
                  )}
                </>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tenant Signatures */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Tenants ({lease.tenants.length})</h4>
          <div className="space-y-2">
            {lease.tenants.map((leaseTenant: any) => (
              <div
                key={leaseTenant.id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg dark:bg-card dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={leaseTenant.tenant.user.avatar || leaseTenant.tenant.user.image}
                    />
                    <AvatarFallback>
                      {leaseTenant.tenant.user.name?.[0] || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {leaseTenant.tenant.user.name}
                      {leaseTenant.isPrimaryTenant && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {leaseTenant.tenant.user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {leaseTenant.signedAt ? (
                    <>
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Signed
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(leaseTenant.signedAt), "MMM d")}
                      </span>
                    </>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t dark:border-gray-800">
          {isLandlord ? (
            <>
              {!landlordSigned && (
                <Button asChild className="flex-1">
                  <Link href={`/dashboard/lease-signing/${lease.id}`}>
                    <FileSignature className="h-4 w-4 mr-2" />
                    Sign Lease
                  </Link>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleResendInvitations}
                disabled={isSending}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : "Resend Invitations"}
              </Button>
            </>
          ) : (
            <>
              {lease.tenants.some((lt: any) => !lt.signedAt) && (
                <Button asChild className="flex-1">
                  <Link href={`/dashboard/lease-signing/${lease.id}`}>
                    <FileSignature className="h-4 w-4 mr-2" />
                    Sign Lease
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" asChild>
                <Link href={`/dashboard/lease-signing/${lease.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Agreement
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Completion Message */}
        {signingProgress === 100 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-900/50">
            <p className="text-sm text-green-800 flex items-center gap-2 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              All signatures collected! Lease is now active.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}