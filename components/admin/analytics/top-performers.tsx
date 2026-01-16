// components/admin/analytics/top-performers.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, Star, DollarSign, Wrench } from "lucide-react";
import Link from "next/link";

interface TopPerformersProps {
  data: {
    topLandlords: Array<{
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      properties: number;
      revenue: number;
    }>;
    topVendors: Array<{
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      rating: number;
      completedTickets: number;
      completedInRange: number;
      category: string;
      reviewCount: number;
    }>;
  } | null;
}

export function TopPerformersSection({ data }: TopPerformersProps) {
  if (!data) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Top Landlords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Top Landlords by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topLandlords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="space-y-4">
              {data.topLandlords.map((landlord, index) => (
                <div
                  key={landlord.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                        {index + 1}
                      </Badge>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={landlord.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-xs">
                        {getInitials(landlord.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/users/${landlord.id}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {landlord.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building className="h-3 w-3" />
                        <span>{landlord.properties} properties</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-semibold text-green-600">
                      <DollarSign className="h-4 w-4" />
                      {landlord.revenue.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Vendors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Top Vendors by Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topVendors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="space-y-4">
              {data.topVendors.map((vendor, index) => (
                <div
                  key={vendor.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                        {index + 1}
                      </Badge>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={vendor.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-xs">
                        {getInitials(vendor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/users/${vendor.id}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {vendor.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{vendor.category.replace(/_/g, ' ')}</span>
                        {vendor.rating > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{vendor.rating.toFixed(1)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold flex items-center gap-1 justify-end">
                      <Wrench className="h-4 w-4" />
                      {vendor.completedTickets}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vendor.completedInRange > 0 
                        ? `${vendor.completedInRange} recent`
                        : 'total jobs'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}