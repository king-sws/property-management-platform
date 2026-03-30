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

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      default: // OPEN
        return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-500";
      case "HIGH":   return "bg-orange-500";
      case "MEDIUM": return "bg-yellow-500";
      default:       return "bg-slate-400";
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
      <CardContent className="space-y-3">
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
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* priority dot */}
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${getPriorityDot(ticket.priority)}`}
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium leading-none">{ticket.title}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getPriorityStyles(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {ticket.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.property.name} •{" "}
                        {format(new Date(ticket.createdAt), "MMM d")}
                      </p>
                    </div>
                  </div>

                  {/* status badge */}
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusStyles(ticket.status)}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}