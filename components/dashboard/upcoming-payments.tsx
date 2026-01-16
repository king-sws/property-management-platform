
// components/dashboard/upcoming-leases.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

export async function UpcomingLeases({ userId }: { userId: string }) {
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  const landlord = await prisma.landlord.findUnique({
    where: { userId },
  });

  if (!landlord) return null;

  const upcomingLeases = await prisma.lease.findMany({
    where: {
      unit: {
        property: {
          landlordId: landlord.id,
        },
      },
      status: "ACTIVE",
      endDate: {
        lte: threeMonthsFromNow,
        gte: new Date(),
      },
      deletedAt: null,
    },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
      tenants: {
        include: {
          tenant: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: { endDate: "asc" },
    take: 5,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Lease Renewals</CardTitle>
        <Link href="/dashboard/leases">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingLeases.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming lease renewals in the next 3 months
          </p>
        ) : (
          upcomingLeases.map((lease) => {
            const daysUntilExpiry = differenceInDays(
              new Date(lease.endDate!),
              new Date()
            );
            const isUrgent = daysUntilExpiry <= 30;

            return (
              <div
                key={lease.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {lease.unit.property.name} - Unit {lease.unit.unitNumber}
                    </p>
                    {isUrgent && (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lease.tenants[0]?.tenant.user.name || "Unknown Tenant"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {format(new Date(lease.endDate!), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge variant={isUrgent ? "destructive" : "secondary"}>
                  {daysUntilExpiry} days
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
