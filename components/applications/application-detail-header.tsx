/* eslint-disable @typescript-eslint/no-explicit-any */
// components/applications/application-detail-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import { MessageAboutApplicationButton } from "../messages/quick-message-buttons";

interface ApplicationDetailHeaderProps {
  application: any;
  isLandlord: boolean;
  isTenant: boolean;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  SUBMITTED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  SCREENING_IN_PROGRESS: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  APPROVED: "bg-green-100 text-green-800 hover:bg-green-100",
  CONDITIONALLY_APPROVED: "bg-teal-100 text-teal-800 hover:bg-teal-100",
  DENIED: "bg-red-100 text-red-800 hover:bg-red-100",
  WITHDRAWN: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  EXPIRED: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SCREENING_IN_PROGRESS: "Screening in Progress",
  APPROVED: "Approved",
  CONDITIONALLY_APPROVED: "Conditionally Approved",
  DENIED: "Denied",
  WITHDRAWN: "Withdrawn",
  EXPIRED: "Expired",
};

export function ApplicationDetailHeader({
  application,
  isLandlord,
  isTenant,
}: ApplicationDetailHeaderProps) {
  const router = useRouter();

  const recipientName = isLandlord
    ? application.tenant.user.name || "Tenant"
    : application.landlord?.user?.name || "Landlord";

  const unitInfo = `${application.unit.property.name} - Unit ${application.unit.unitNumber}`;

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/applications")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Application Details
              </h1>
              <Badge className={statusColors[application.status]}>
                {statusLabels[application.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {isLandlord && `Application from ${application.tenant.user.name}`}
              {isTenant && `Application for ${application.unit.property.name}`}
            </p>
            <p className="text-sm text-muted-foreground">
              Application ID: {application.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>
      {/* MESSAGE BUTTON - Available to both landlord and tenant */}
      {(isLandlord || isTenant) && (
        <MessageAboutApplicationButton
          applicationId={application.id}
          recipientName={recipientName}
          unitInfo={unitInfo}
          variant="outline"
        />
      )}
    </div>
  );
}