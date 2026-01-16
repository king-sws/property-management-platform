/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/pending-signatures-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSignature, Building2, Calendar, ArrowRight } from "lucide-react";
import { getPendingSignatures } from "@/actions/lease-signing";
import { format } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function PendingSignaturesWidget() {
  const [pendingLeases, setPendingLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPendingSignatures() {
      const result = await getPendingSignatures();
      if (result.success) {
        setPendingLeases(result.data || []);
      }
      setLoading(false);
    }
    loadPendingSignatures();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Pending Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingLeases.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-orange-600" />
            Pending Signatures
          </CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {pendingLeases.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingLeases.slice(0, 3).map((lease) => (
          <div
            key={lease.id}
            className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {lease.unit.property.name} - Unit {lease.unit.unitNumber}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Start: {format(new Date(lease.startDate), "MMM d, yyyy")}</span>
                </div>
                <span>•</span>
                <span>${lease.rentAmount.toLocaleString()}/mo</span>
              </div>
              {lease.tenants && lease.tenants.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Tenant: {lease.tenants[0].tenant.user.name}
                </p>
              )}
            </div>
            <Button asChild size="sm">
              <Link href={`/dashboard/lease-signing/${lease.id}`}>
                Sign Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        ))}

        {pendingLeases.length > 3 && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/leases?status=PENDING_SIGNATURE">
              View All ({pendingLeases.length})
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}