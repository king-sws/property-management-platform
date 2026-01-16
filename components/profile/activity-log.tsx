/* eslint-disable @typescript-eslint/no-explicit-any */
// components/profile/activity-log.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { getActivityLog } from "@/actions/profile";
import { toast } from "sonner";

interface ActivityLogProps {
  initialActivities: any[];
}

export function ActivityLog({ initialActivities }: ActivityLogProps) {
  const [activities, setActivities] = useState(initialActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialActivities.length);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const result = await getActivityLog(20, offset);

      if (result.success && result.data) {
        setActivities([...activities, ...result.data.activities]);
        setHasMore(result.data.hasMore);
        setOffset(offset + result.data.activities.length);
      } else {
        toast.error(result.error || "Failed to load activities");
      }
    } catch (error) {
      console.error("Load activities error:", error);
      toast.error("Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getActivityIcon = (type: string) => {
    return Activity;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "USER_LOGIN":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "USER_LOGOUT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "PROPERTY_CREATED":
      case "PROPERTY_UPDATED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PAYMENT_MADE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "TICKET_CREATED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>
          Complete history of your actions on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any, index: number) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="rounded-full bg-primary/10 p-2.5 mt-1">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-relaxed">
                          {activity.action}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getActivityColor(activity.type)}`}
                          >
                            {activity.type.replace(/_/g, " ")}
                          </Badge>
                          {activity.ipAddress && (
                            <span className="text-xs text-muted-foreground">
                              IP: {activity.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right whitespace-nowrap">
                        {format(new Date(activity.createdAt), "MMM d, yyyy")}
                        <br />
                        {format(new Date(activity.createdAt), "h:mm a")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="pt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
