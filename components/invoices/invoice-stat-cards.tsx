import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react";

interface StatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    paid: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  };
  role: "vendor" | "landlord";
}

export function InvoiceStatCards({ stats, role }: StatsProps) {
  const cards = [
    {
      title: "Total Invoices",
      value: stats.total,
      icon: FileText,
      description: "All time",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      description: `$${stats.pendingAmount.toLocaleString()}`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      description: "Awaiting payment",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: role === "vendor" ? "Received" : "Paid",
      value: `$${stats.paidAmount.toLocaleString()}`,
      icon: DollarSign,
      description: `${stats.paid} invoices`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}