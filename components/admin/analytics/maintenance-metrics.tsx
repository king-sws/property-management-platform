
// components/admin/analytics/maintenance-metrics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface MaintenanceMetricsProps {
  data: {
    ticketsByStatus: { status: string; count: number }[];
    ticketsByPriority: { priority: string; count: number }[];
    avgResolutionTime: number;
    completedCount: number;
    ticketsByCategory: { category: string; count: number }[];
  } | null;
}

export function MaintenanceMetrics({ data }: MaintenanceMetricsProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "COMPLETED": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resolution Time */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Resolution Time</div>
              <div className="text-2xl font-bold">{data.avgResolutionTime} days</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>{data.completedCount} completed</span>
          </div>
        </div>

        {/* Tickets by Status */}
        <div>
          <h4 className="text-sm font-medium mb-3">By Status</h4>
          <div className="grid grid-cols-2 gap-3">
            {data.ticketsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{item.status.replace(/_/g, ' ')}</span>
                <Badge className={getStatusColor(item.status)} variant="secondary">
                  {item.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <h4 className="text-sm font-medium mb-3">Top Categories</h4>
          <div className="space-y-2">
            {data.ticketsByCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.category}</span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}