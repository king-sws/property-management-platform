// components/admin/system/recent-activity.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityLogProps {
  data: Array<{
    id: string;
    type: string;
    action: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
      image: string | null;
      role: string;
    } | null;
  }> | null;
}

export function RecentActivityLog({ data }: RecentActivityLogProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "USER_LOGIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "PROPERTY_CREATED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      case "PROPERTY_DELETED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      case "PAYMENT_MADE":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 20).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              {activity.user && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={activity.user.avatar || activity.user.image || undefined} />
                  <AvatarFallback className="bg-primary/10 text-xs">
                    {getInitials(activity.user.name || "U")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {activity.user?.name || "System"}
                  </span>
                  <Badge className={getActivityColor(activity.type)} variant="secondary">
                    {activity.type.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}