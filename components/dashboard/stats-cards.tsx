// components/dashboard/stats-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp,  LucideIcon } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "border-slate-200 dark:border-slate-800",
  success: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
  warning: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20",
  danger: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20",
};

const iconStyles = {
  default: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800",
  success: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900",
  danger: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("rounded-lg p-2", iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold sm:text-3xl">{value}</div>
          
          {(description || trend) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    trend.isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
              {description && <span>{description}</span>}
              {trend?.label && <span>{trend.label}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component for grouped stats
export interface QuickStatsProps {
  stats: StatsCardProps[];
  className?: string;
}

export function QuickStats({ stats, className }: QuickStatsProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}