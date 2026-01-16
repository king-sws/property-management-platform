/* eslint-disable @typescript-eslint/no-explicit-any */
// components/vendors/vendor-card.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Wrench, MapPin, MoreVertical, Edit, Trash2, Eye, Star, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  vendor: {
    id: string;
    businessName: string;
    category: string;
    isActive: boolean;
    rating: number | null;
    reviewCount: number;
    city: string | null;
    state: string | null;
    services: string[];
    user: {
      name: string;
      email: string;
      phone: string | null;
      avatar: string | null;
      image: string | null;
    };
    tickets: any[];
    _count?: {
      tickets: number;
      reviews: number;
      appointments: number;
    };
  };
}

const categoryLabels: Record<string, string> = {
  PLUMBER: "Plumber",
  ELECTRICIAN: "Electrician",
  HVAC: "HVAC",
  LANDSCAPING: "Landscaping",
  CLEANING: "Cleaning",
  PEST_CONTROL: "Pest Control",
  GENERAL_CONTRACTOR: "General Contractor",
  HANDYMAN: "Handyman",
  APPLIANCE_REPAIR: "Appliance Repair",
  LOCKSMITH: "Locksmith",
  PAINTER: "Painter",
  ROOFER: "Roofer",
  COMMERCIAL: "Commercial",
  OTHER: "Other",
};

const categoryColors: Record<string, string> = {
  PLUMBER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ELECTRICIAN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  HVAC: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  LANDSCAPING: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CLEANING: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  PEST_CONTROL: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  GENERAL_CONTRACTOR: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  HANDYMAN: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  APPLIANCE_REPAIR: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  LOCKSMITH: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  PAINTER: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  ROOFER: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  OTHER: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
};

export function VendorCard({ vendor }: VendorCardProps) {
  const activeJobs = vendor.tickets.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "SCHEDULED"
  ).length;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Avatar Header */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <div className="flex h-full items-center justify-center">
          <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-700 shadow-lg">
            <AvatarImage src={vendor.user.avatar || vendor.user.image || ""} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {vendor.businessName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Category Badge */}
        <Badge className={cn("absolute left-3 top-3", categoryColors[vendor.category])}>
          {categoryLabels[vendor.category] || vendor.category}
        </Badge>

        {/* Actions Menu */}
        <div className="absolute right-3 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/vendors/${vendor.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/vendors/${vendor.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Vendor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-3 right-3">
          {vendor.isActive ? (
            <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              Inactive
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <div>
            <Link href={`/dashboard/vendors/${vendor.id}`}>
              <h3 className="font-semibold leading-none transition-colors hover:text-primary line-clamp-1">
                {vendor.businessName}
              </h3>
            </Link>
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">
              {vendor.user.name}
            </p>
            {vendor.city && vendor.state && (
              <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="line-clamp-1">
                  {vendor.city}, {vendor.state}
                </span>
              </div>
            )}
          </div>

          {/* Rating */}
          {vendor.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(vendor.rating!)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({vendor.reviewCount})
              </span>
            </div>
          )}

          {/* Services */}
          {vendor.services.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Services:</p>
              <div className="flex flex-wrap gap-1">
                {vendor.services.slice(0, 3).map((service, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {vendor.services.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{vendor.services.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Active Jobs</p>
              <p className="font-semibold text-primary">
                {activeJobs}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
              <p className="font-semibold">
                {vendor.tickets.length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t p-4">
        <div className="flex w-full gap-2">
          <Link href={`/dashboard/vendors/${vendor.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          <Link href={`/dashboard/vendors/${vendor.id}/tickets`} className="flex-1">
            <Button variant="default" className="w-full">
              View Jobs
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}