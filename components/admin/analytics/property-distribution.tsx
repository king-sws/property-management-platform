/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/analytics/property-distribution.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PropertyDistributionProps {
  data: {
    propertiesByType: { type: string; count: number }[];
    occupancyData: any;
    occupancyRate: number;
    totalUnits: number;
  } | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PropertyDistribution({ data }: PropertyDistributionProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = data.propertiesByType.map((item) => ({
    name: item.type.replace(/_/g, ' '),
    value: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center pt-4 border-t">
            <div className="text-2xl font-bold">{data.occupancyRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Occupancy Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.occupancyData.OCCUPIED} / {data.totalUnits} units occupied
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}