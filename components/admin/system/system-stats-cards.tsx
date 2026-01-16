// components/admin/system/system-stats-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, Wrench, TrendingUp, AlertCircle } from "lucide-react";

interface SystemStatsCardsProps {
  data: {
    totalUsers: number;
    activeUsers: number;
    totalProperties: number;
    activeLeases: number;
    openTickets: number;
    pendingApplications: number;
    totalPayments: number;
    failedPayments: number;
    uptime: string;
    lastRestart: Date;
  } | null;
}

export function SystemStatsCards({ data }: SystemStatsCardsProps) {
  if (!data) return null;

  const cards = [
    {
      title: "Users",
      value: data.totalUsers.toLocaleString(),
      subtitle: `${data.activeUsers} active`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Properties",
      value: data.totalProperties.toLocaleString(),
      subtitle: `${data.activeLeases} active leases`,
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Open Tickets",
      value: data.openTickets.toLocaleString(),
      subtitle: `${data.pendingApplications} pending apps`,
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "System Health",
      value: data.uptime,
      subtitle: `${data.failedPayments} failed payments`,
      icon: data.failedPayments > 10 ? AlertCircle : TrendingUp,
      color: data.failedPayments > 10 ? "text-red-600" : "text-emerald-600",
      bgColor: data.failedPayments > 10 ? "bg-red-100 dark:bg-red-900/20" : "bg-emerald-100 dark:bg-emerald-900/20",
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
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}





