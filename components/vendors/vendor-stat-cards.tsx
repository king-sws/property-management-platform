// components/vendors/vendor-stat-cards.tsx
import { Card } from "@/components/ui/card";
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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed Jobs",
      value: stats.completedJobs,
      icon: CheckCircle,
      description: `${stats.completionRate.toFixed(0)}% completion rate`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Average Rating",
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "N/A",
      icon: Star,
      description: `${stats.totalReviews} reviews`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Upcoming",
      value: stats.upcomingAppointments,
      icon: Calendar,
      description: "Scheduled appointments",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}