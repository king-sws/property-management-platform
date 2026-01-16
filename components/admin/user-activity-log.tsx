// components/admin/user-activity-log.tsx
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";
import { Typography } from "@/components/ui/typography";

interface ActivityLogEntry {
  id: string;
  action: string;
  createdAt: Date;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
}

interface UserActivityLogProps {
  activities: ActivityLogEntry[];
}

export function UserActivityLog({ activities }: UserActivityLogProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <Typography variant="muted">No activity logs yet</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
        >
          <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
          <div className="flex-1 space-y-1">
            <Typography className="text-sm">{activity.action}</Typography>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{activity.type}</span>
              {activity.entityType && (
                <>
                  <span>•</span>
                  <span>{activity.entityType}</span>
                </>
              )}
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}