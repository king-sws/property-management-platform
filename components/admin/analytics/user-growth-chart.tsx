/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/analytics/user-growth-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface UserGrowthChartProps {
  data: {
    chartData: any[];
    usersByRole: { role: string; count: number }[];
  } | null;
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  if (!data || data.chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Line type="monotone" dataKey="LANDLORD" stroke="#3b82f6" strokeWidth={2} name="Landlords" />
            <Line type="monotone" dataKey="TENANT" stroke="#10b981" strokeWidth={2} name="Tenants" />
            <Line type="monotone" dataKey="VENDOR" stroke="#f59e0b" strokeWidth={2} name="Vendors" />
            <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Total" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}




