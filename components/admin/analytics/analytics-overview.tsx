// components/admin/analytics/analytics-overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsOverviewProps {
  data: {
    totalUsers: number;
    newUsers: number;
    totalProperties: number;
    newProperties: number;
    totalRevenue: number;
    revenueChange: number;
    activeLeases: number;
    newLeases: number;
    openTickets: number;
    ticketsCreated: number;
  } | null;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  if (!data) return null;

  const cards = [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      change: `+${data.newUsers} new`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Properties",
      value: data.totalProperties.toLocaleString(),
      change: `+${data.newProperties} new`,
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Revenue",
      value: `$${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: data.revenueChange >= 0 ? `+${data.revenueChange.toFixed(1)}%` : `${data.revenueChange.toFixed(1)}%`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      trend: data.revenueChange >= 0 ? "up" : "down",
    },
    {
      title: "Active Leases",
      value: data.activeLeases.toLocaleString(),
      change: `+${data.newLeases} new`,
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`${card.bgColor} ${card.color} rounded-full p-2`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {card.trend && (
                card.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )
              )}
              <span>{card.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}