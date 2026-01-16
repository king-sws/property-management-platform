// components/admin/system/database-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DatabaseStatsProps {
  data: {
    totalRecords: number;
    tables: {
      users: number;
      properties: number;
      units: number;
      leases: number;
      payments: number;
      tickets: number;
      documents: number;
      notifications: number;
      activityLogs: number;
      messages: number;
    };
  } | null;
}

export function DatabaseStats({ data }: DatabaseStatsProps) {
  if (!data) return null;

  const tableData = Object.entries(data.tables).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
    percentage: (count / data.totalRecords) * 100,
  })).sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Total Records</div>
            <div className="text-2xl font-bold">{data.totalRecords.toLocaleString()}</div>
          </div>
          <Database className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          {tableData.map((table) => (
            <div key={table.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{table.name}</span>
                <span className="text-muted-foreground">{table.count.toLocaleString()}</span>
              </div>
              <Progress value={table.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}