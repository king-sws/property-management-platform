
// components/dashboard/maintenance-overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function MaintenanceOverview({ userId }: { userId: string }) {
  const landlord = await prisma.landlord.findUnique({
    where: { userId },
  });

  if (!landlord) return null;

  const tickets = await prisma.maintenanceTicket.findMany({
    where: {
      property: {
        landlordId: landlord.id,
      },
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
      deletedAt: null,
    },
    include: {
      property: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "default";
      case "MEDIUM":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Maintenance Requests</CardTitle>
        <Link href="/dashboard/maintenance">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open maintenance requests
          </p>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/maintenance/${ticket.id}`}
              className="block"
            >
              <div className="rounded-lg border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-[#181a1b]">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{ticket.title}</p>
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.property.name} • {format(new Date(ticket.createdAt), "MMM d")}
                    </p>
                  </div>
                  <Badge variant="outline">{ticket.status}</Badge>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
