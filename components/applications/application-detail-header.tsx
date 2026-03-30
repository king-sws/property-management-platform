/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Hash } from "lucide-react";
import { MessageAboutApplicationButton } from "../messages/quick-message-buttons";

interface ApplicationDetailHeaderProps {
  application: any;
  isLandlord: boolean;
  isTenant: boolean;
}

const statusColors: Record<string, string> = {
  DRAFT:                  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  SUBMITTED:              "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  UNDER_REVIEW:           "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  SCREENING_IN_PROGRESS:  "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  APPROVED:               "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  CONDITIONALLY_APPROVED: "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
  DENIED:                 "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  WITHDRAWN:              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  EXPIRED:                "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusLabels: Record<string, string> = {
  DRAFT:                  "Draft",
  SUBMITTED:              "Submitted",
  UNDER_REVIEW:           "Under Review",
  SCREENING_IN_PROGRESS:  "Screening in Progress",
  APPROVED:               "Approved",
  CONDITIONALLY_APPROVED: "Conditionally Approved",
  DENIED:                 "Denied",
  WITHDRAWN:              "Withdrawn",
  EXPIRED:                "Expired",
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

  const unitInfo = `${application.unit.property.name} · Unit ${application.unit.unitNumber}`;

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left: back + title + meta */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/applications")}
          className="gap-2 px-0 h-auto text-muted-foreground hover:text-foreground -ml-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-semibold">Application</h1>
          <Badge className={statusColors[application.status] ?? ""}>
            {statusLabels[application.status] ?? application.status}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
          {isLandlord && (
            <span>
              From{" "}
              <span className="font-medium text-foreground">
                {application.tenant.user.name}
              </span>
            </span>
          )}
          {isTenant && (
            <span>
              For{" "}
              <span className="font-medium text-foreground">
                {application.unit.property.name}
              </span>
            </span>
          )}
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {unitInfo}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3 shrink-0" />
            {application.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      {(isLandlord || isTenant) && (
        <div className="flex gap-2 shrink-0 pt-8">
          <MessageAboutApplicationButton
            applicationId={application.id}
            recipientName={recipientName}
            unitInfo={unitInfo}
            variant="outline"
          />
        </div>
      )}
    </div>
  );
}