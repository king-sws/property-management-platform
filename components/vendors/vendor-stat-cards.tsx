// components/vendors/vendor-stat-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Star, Calendar } from "lucide-react";

interface VendorStatCardsProps {
  stats: {
    totalJobs: number;
    completedJobs: number;
    activeJobs: number;
    completionRate: number;
    averageRating: number | null;
    totalReviews: number;
    upcomingAppointments: number;
  };
}

export function VendorStatCards({ stats }: VendorStatCardsProps) {
  const cards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: Clock,
      description: "Currently in progress",
      iconClass: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "Completed Jobs",
      value: stats.completedJobs,
      icon: CheckCircle,
      description: `${stats.completionRate.toFixed(0)}% completion rate`,
      iconClass: "text-green-600",
      iconBg: "bg-green-50 dark:bg-green-950/40",
    },
    {
      title: "Average Rating",
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "—",
      icon: Star,
      description: `${stats.totalReviews} review${stats.totalReviews !== 1 ? "s" : ""}`,
      iconClass: "text-yellow-600",
      iconBg: "bg-yellow-50 dark:bg-yellow-950/40",
    },
    {
      title: "Upcoming",
      value: stats.upcomingAppointments,
      icon: Calendar,
      description: "Scheduled appointments",
      iconClass: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`${card.iconBg} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${card.iconClass}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}