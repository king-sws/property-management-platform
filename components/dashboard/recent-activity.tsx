// components/dashboard/recent-activity.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export async function RecentActivity({ userId }: { userId: string }) {
  const activities = await prisma.activityLog.findMany({
    where: {
      userId,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const getActivityIcon = (type: string) => {
    const initial = type.charAt(0);
    return initial;
  };

  const getActivityColor = (type: string) => {
    if (type.includes("PAYMENT")) return "bg-green-100 text-green-600";
    if (type.includes("TICKET")) return "bg-amber-100 text-amber-600";
    if (type.includes("LEASE")) return "bg-blue-100 text-blue-600";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-75 pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className={`h-10 w-10 ${getActivityColor(activity.type)}`}>
                    <AvatarFallback className="bg-transparent">
                      {getActivityIcon(activity.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
